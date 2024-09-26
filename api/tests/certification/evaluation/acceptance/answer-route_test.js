import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  mockLearningContent,
} from '../../../test-helper.js';

describe('Certification | Evaluation | Acceptance | answer-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/answers', function () {
    context('when challenge is focused out and answer is correct', function () {
      context('when the candidate needs an accessibility adjustment', function () {
        it('should save the answer as correct', async function () {
          // given
          const { competenceId, challengeId } = _buildLearningContent();
          const { assessmentId, userId } = await _setupTestData(databaseBuilder, {
            competenceId,
            doesCandidateNeedAccessibilityAdjustment: true,
          });
          const options = _setupRequestOptions({ userId, challengeId, assessmentId });

          // when
          await server.inject(options);

          // then
          const [answer] = await knex('answers');
          expect(answer.result).to.equal('ok');
          expect(answer.isFocusedOut).to.equal(true);
        });
      });

      context('when the candidate does not need an accessibility adjustment', function () {
        it('should save the answer as focused out', async function () {
          // given
          const { competenceId, challengeId } = _buildLearningContent();
          const { assessmentId, userId } = await _setupTestData(databaseBuilder, {
            competenceId,
            doesCandidateNeedAccessibilityAdjustment: false,
          });
          const options = _setupRequestOptions({ userId, challengeId, assessmentId });

          // when
          await server.inject(options);

          // then
          const [answer] = await knex('answers');
          expect(answer.result).to.equal('focusedOut');
          expect(answer.isFocusedOut).to.equal(true);
        });
      });
    });
  });
});

async function _setupTestData(databaseBuilder, { competenceId, doesCandidateNeedAccessibilityAdjustment }) {
  const userId = databaseBuilder.factory.buildUser().id;

  const session = databaseBuilder.factory.buildSession({});

  databaseBuilder.factory.buildCertificationCandidate({
    sessionId: session.id,
    userId,
    accessibilityAdjustmentNeeded: doesCandidateNeedAccessibilityAdjustment,
  });

  const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
    userId,
    sessionId: session.id,
  });

  const assessment = databaseBuilder.factory.buildAssessment({
    type: 'CERTIFICATION',
    userId,
    competenceId,
    certificationCourseId: certificationCourse.id,
  });

  await databaseBuilder.commit();

  return { assessmentId: assessment.id, userId };
}

function _setupRequestOptions({ userId, challengeId, assessmentId }) {
  return {
    method: 'POST',
    url: '/api/answers',
    headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
    payload: {
      data: {
        type: 'answers',
        attributes: {
          value: 'correct',
          'focused-out': true,
        },
        relationships: {
          assessment: {
            data: {
              type: 'assessments',
              id: assessmentId,
            },
          },
          challenge: {
            data: {
              type: 'challenges',
              id: challengeId,
            },
          },
        },
      },
    },
  };
}

function _buildLearningContent() {
  const challengeId = 'a_challenge_id';
  const competenceId = 'recCompetence';

  const learningContent = {
    areas: [{ id: 'recArea1', competenceIds: ['recCompetence'] }],
    competences: [
      {
        id: 'recCompetence',
        areaId: 'recArea1',
        skillIds: ['recSkill1'],
        origin: 'Pix',
        name_i18n: {
          fr: 'Nom de la competence FR',
          en: 'Nom de la competence EN',
        },
        statue: 'active',
      },
    ],
    skills: [
      {
        id: 'recSkill1',
        name: '@recArea1_Competence1_Tube1_Skill1',
        status: 'actif',
        competenceId: competenceId,
        pixValue: '5',
      },
    ],
    challenges: [
      {
        id: challengeId,
        competenceId: competenceId,
        skillId: 'recSkill1',
        status: 'validé',
        solution: 'correct',
        proposals: '${a}',
        locales: ['fr-fr'],
        type: 'QROC',
        focusable: true,
      },
    ],
  };
  mockLearningContent(learningContent);

  return {
    competenceId,
    challengeId,
  };
}
