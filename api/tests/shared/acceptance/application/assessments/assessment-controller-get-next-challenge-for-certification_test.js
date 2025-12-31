import { AlgorithmEngineVersion } from '../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import { CertificationCompanionLiveAlertStatus } from '../../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  knex,
  learningContentBuilder,
  mockLearningContent,
  sinon,
} from '../../../../test-helper.js';

const competenceId = 'recCompetence';
const skillWeb1Id = 'recAcquisWeb1';
const skillWeb2Id = 'recAcquisWeb2';
const skillWeb3Id = 'recAcquisWeb3';

const firstChallengeId = 'recFirstChallenge';
const secondChallengeId = 'recSecondChallenge';
const thirdChallengeId = 'recThirdChallenge';
const otherChallengeId = 'recOtherChallenge';

const learningContent = [
  {
    id: 'recArea1',
    title_i18n: {
      fr: 'area1_Title',
    },
    color: 'someColor',
    competences: [
      {
        id: competenceId,
        name_i18n: {
          fr: 'Mener une recherche et une veille d’information',
        },
        index: '1.1',
        tubes: [
          {
            id: 'recTube0_0',
            skills: [
              {
                id: skillWeb2Id,
                nom: '@web2',
                challenges: [{ id: firstChallengeId, alpha: 2.8, delta: 1.1, langues: ['Franco Français'] }],
              },
              {
                id: skillWeb3Id,
                nom: '@web3',
                challenges: [{ id: secondChallengeId, langues: ['Franco Français'], alpha: -1.2, delta: 3.3 }],
              },
              {
                id: skillWeb1Id,
                nom: '@web1',
                challenges: [
                  { id: thirdChallengeId, alpha: -0.2, delta: 2.7, langues: ['Franco Français'] },
                  { id: otherChallengeId, alpha: -0.2, delta: -0.4, langues: ['Franco Français'] },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('Acceptance | API | assessment-controller-get-next-challenge-for-certification', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    await mockLearningContent(learningContentObjects);
  });

  describe('GET /api/assessments/:assessment_id', function () {
    const assessmentId = 1;
    const userId = 1234;

    context('When there are still challenges to answer', function () {
      let clock;

      beforeEach(async function () {
        const user = databaseBuilder.factory.buildUser({ id: userId });
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const sessionId = databaseBuilder.factory.buildSession({
          certificationCenterId,
          version: AlgorithmEngineVersion.V3,
        }).id;
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          isPublished: false,
          version: AlgorithmEngineVersion.V3,
          userId,
          sessionId,
        }).id;

        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          ...user,
          userId: user.id,
          sessionId,
          reconciledAt: new Date('2020-01-15'),
        });
        const version = databaseBuilder.factory.buildCertificationVersion({
          scope: SCOPES.CORE,
          startDate: new Date('2020-01-10'),
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: firstChallengeId,
          versionId: version.id,
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: secondChallengeId,
          versionId: version.id,
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: thirdChallengeId,
          versionId: version.id,
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: otherChallengeId,
          versionId: version.id,
        });

        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: Assessment.types.CERTIFICATION,
          certificationCourseId,
          userId,
          lastQuestionDate: new Date('2020-01-20'),
          state: 'started',
        });
        databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
        await databaseBuilder.commit();

        clock = sinon.useFakeTimers({
          now: Date.now(),
          toFake: ['Date'],
        });
      });

      afterEach(async function () {
        clock.restore();
      });

      it('should save and return an assessment', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        const lastQuestionDate = new Date();

        // when
        const response = await server.inject(options);

        // then
        const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('lastQuestionDate');
        const { count: countSavedChallenge } = await knex('certification-challenges').count('* AS count').first();

        expect(assessmentsInDb.lastQuestionDate).to.deep.equal(lastQuestionDate);
        expect(countSavedChallenge).to.equal(1);
        expect(response.result.data.id).to.equal(assessmentId.toString());
        expect(response.result.data.relationships['next-challenge'].data.id).to.be.oneOf([
          firstChallengeId,
          secondChallengeId,
          thirdChallengeId,
          otherChallengeId,
        ]);
      });
    });

    context('When there is are ongoing live and companion alerts for a challenge', function () {
      beforeEach(async function () {
        const user = databaseBuilder.factory.buildUser({ id: userId });
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const sessionId = databaseBuilder.factory.buildSession({
          certificationCenterId,
          version: AlgorithmEngineVersion.V3,
        }).id;
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          isPublished: false,
          version: AlgorithmEngineVersion.V3,
          userId,
          sessionId,
        }).id;
        databaseBuilder.factory.buildCertificationCandidate({ ...user, userId: user.id, sessionId });
        const assessment = databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: Assessment.types.CERTIFICATION,
          certificationCourseId,
          lastChallengeId: firstChallengeId,
          userId,
          lastQuestionDate: new Date('2020-01-20'),
          state: 'started',
        });
        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessment.id,
          challengeId: firstChallengeId,
          status: CertificationChallengeLiveAlertStatus.ONGOING,
        });
        databaseBuilder.factory.buildCertificationCompanionLiveAlert({
          assessmentId: assessment.id,
          status: CertificationCompanionLiveAlertStatus.ONGOING,
        });
        databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
        await databaseBuilder.commit();
      });

      it('returns flags related to live alerts', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data.attributes['has-ongoing-challenge-live-alert']).to.be.true;
        expect(response.result.data.attributes['has-ongoing-companion-live-alert']).to.be.true;
      });
    });

    context('When there is a validated live alert for a challenge', function () {
      beforeEach(async function () {
        const user = databaseBuilder.factory.buildUser({ id: userId });
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const sessionId = databaseBuilder.factory.buildSession({
          certificationCenterId,
          version: AlgorithmEngineVersion.V3,
        }).id;
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          isPublished: false,
          version: AlgorithmEngineVersion.V3,
          userId,
          sessionId,
        }).id;
        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          ...user,
          userId: user.id,
          sessionId,
          reconciledAt: new Date('2020-01-01'),
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
        const assessment = databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: Assessment.types.CERTIFICATION,
          certificationCourseId,
          lastChallengeId: firstChallengeId,
          userId,
          lastQuestionDate: new Date('2020-01-20'),
          state: 'started',
        });
        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessment.id,
          challengeId: firstChallengeId,
          status: 'validated',
        });
        databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
        const version = databaseBuilder.factory.buildCertificationVersion({
          scope: SCOPES.CORE,
          startDate: new Date('2019-01-01'),
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: firstChallengeId,
          versionId: version.id,
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: secondChallengeId,
          versionId: version.id,
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: thirdChallengeId,
          versionId: version.id,
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: otherChallengeId,
          versionId: version.id,
        });

        await databaseBuilder.commit();
      });

      it('returns another challenge', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data.id).to.not.equal(firstChallengeId);
        const assessment = await knex('assessments').first();
        expect(assessment.lastChallengeId).to.not.equal(firstChallengeId);
      });
    });

    context('When resuming certification session after leaving', function () {
      it('should return the last challenge the user has seen before leaving the session', async function () {
        const user = databaseBuilder.factory.buildUser({ id: userId });
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const sessionId = databaseBuilder.factory.buildSession({
          certificationCenterId,
          version: AlgorithmEngineVersion.V3,
        }).id;
        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          userId: user.id,
          sessionId,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          isPublished: false,
          version: AlgorithmEngineVersion.V3,
          userId: user.id,
          sessionId,
        }).id;
        databaseBuilder.factory.buildCertificationChallenge({
          associatedSkillName: '@web3',
          associatedSkillId: skillWeb3Id,
          challengeId: secondChallengeId,
          competenceId,
          courseId: certificationCourseId,
        });
        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: Assessment.types.CERTIFICATION,
          certificationCourseId,
          userId: user.id,
          lastQuestionDate: new Date('2020-01-20'),
          state: 'started',
          lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
        });
        databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
        await databaseBuilder.commit();

        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data.relationships['next-challenge'].data.id).to.equal(secondChallengeId);
      });
    });
  });
});
