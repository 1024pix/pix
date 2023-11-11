import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
  learningContentBuilder,
  knex,
  sinon,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { CertificationVersion } from '../../../../src/shared/domain/models/CertificationVersion.js';

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
    mockLearningContent(learningContentObjects);
  });

  describe('GET /api/assessments/:assessment_id/next', function () {
    const assessmentId = 1;
    const userId = 1234;

    context('When passing a V3 certification session', function () {
      context('When there is still challenges to answer', function () {
        let clock;

        beforeEach(async function () {
          databaseBuilder.factory.buildUser({ id: userId });
          const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ isV3Pilot: true }).id;
          const sessionId = databaseBuilder.factory.buildSession({
            certificationCenterId,
            version: CertificationVersion.V3,
          }).id;
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            isPublished: false,
            version: CertificationVersion.V3,
            userId,
            sessionId,
          }).id;
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

        it('should save and return a challenge', async function () {
          // given
          const options = {
            method: 'GET',
            url: `/api/assessments/${assessmentId}/next`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          };

          const lastQuestionDate = new Date();

          // when
          const response = await server.inject(options);

          // then
          const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('lastQuestionDate');
          const { count: countSavedChallenge } = await knex('certification-challenges').count('* AS count').first();

          expect(assessmentsInDb.lastQuestionDate).to.deep.equal(lastQuestionDate);
          expect(countSavedChallenge).to.equal(1);
          expect(response.result.data.id).to.be.oneOf([
            firstChallengeId,
            secondChallengeId,
            thirdChallengeId,
            otherChallengeId,
          ]);
        });
      });

      context('When resuming certification session after leaving', function () {
        it('should return the last challenge the user has seen before leaving the session', async function () {
          const user = databaseBuilder.factory.buildUser({ id: userId });
          const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ isV3Pilot: true }).id;
          const sessionId = databaseBuilder.factory.buildSession({
            certificationCenterId,
            version: CertificationVersion.V3,
          }).id;
          databaseBuilder.factory.buildCertificationCandidate({
            userId: user.id,
            sessionId,
          });
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            isPublished: false,
            version: CertificationVersion.V3,
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
            url: `/api/assessments/${assessmentId}/next`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.result.data.id).to.equal(secondChallengeId);
        });
      });
    });

    context('When passing a V2 certification session', function () {
      context('When resuming certification session after leaving', function () {
        it('should return the last challenge the user has seen before leaving the session', async function () {
          const user = databaseBuilder.factory.buildUser({ id: userId });
          const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ isV3Pilot: true }).id;
          const sessionId = databaseBuilder.factory.buildSession({
            certificationCenterId,
          }).id;
          databaseBuilder.factory.buildCertificationCandidate({
            userId: user.id,
            sessionId,
          });
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            isPublished: false,
            userId: user.id,
            sessionId,
          }).id;
          databaseBuilder.factory.buildCertificationChallenge({
            associatedSkillName: '@web3',
            associatedSkillId: skillWeb3Id,
            challengeId: firstChallengeId,
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
            url: `/api/assessments/${assessmentId}/next`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.result.data.id).to.equal(firstChallengeId);
        });
      });
    });
  });
});
