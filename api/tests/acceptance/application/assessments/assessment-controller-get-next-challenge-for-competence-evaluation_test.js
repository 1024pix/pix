const {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  LearningContentMock,
  knex,
  sinon,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const { types } = require('../../../../lib/domain/models/Assessment');
const { SourceType, StatusType } = require('../../../../lib/domain/models/KnowledgeElement');

describe('Acceptance | API | assessment-controller-get-next-challenge-for-competence-evaluation', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    LearningContentMock.mockCommon();
  });

  describe('GET /api/assessments/:assessment_id/next', function () {
    const assessmentId = 1;
    const userId = 1234;

    context('When there are still challenges to answer', function () {
      let clock;
      const nextChallengeId = 'challengePixA1C1Th1Tu1S3Ch1';

      beforeEach(async function () {
        _buildAssessmentWithFirstTwoSkillsAnswered(assessmentId, userId);
        await databaseBuilder.commit();

        clock = sinon.useFakeTimers({
          now: Date.now(),
          toFake: ['Date'],
        });
      });

      afterEach(async function () {
        clock.restore();
      });

      it('should return next challenge for a higher level skill if the first answer is correct', async function () {
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
        expect(assessmentsInDb.lastQuestionDate).to.deep.equal(lastQuestionDate);
        expect(response.result.data.id).to.equal(nextChallengeId);
      });

      it('should save the asked challenge', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/next`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };

        // when
        const response = await server.inject(options);

        // then
        const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('lastChallengeId');
        expect(assessmentsInDb.lastChallengeId).to.deep.equal(nextChallengeId);
        expect(response.result.data.id).to.equal(nextChallengeId);
      });
    });

    context('When there is no more challenges to answer', function () {
      const latestChallengeAnsweredId = 'challengePixA1C1Th1Tu1S3Ch1';
      beforeEach(async function () {
        _buildAssessmentWithAllSkillsAnswered(assessmentId, userId, latestChallengeAnsweredId);
        await databaseBuilder.commit();
      });

      it('should finish the test', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/next`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: null,
        });
      });

      it('should not overwrite the lastChallengeId saved in assessment', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/next`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };

        // when
        await server.inject(options);

        // then
        const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('lastChallengeId');
        expect(assessmentsInDb.lastChallengeId).to.deep.equal(latestChallengeAnsweredId);
      });
    });
  });
});

function _buildAssessmentWithFirstTwoSkillsAnswered(assessmentId, userId) {
  const competenceId = 'competencePixA1C1';
  databaseBuilder.factory.buildUser({ id: userId });
  databaseBuilder.factory.buildAssessment({
    id: assessmentId,
    type: types.COMPETENCE_EVALUATION,
    userId,
    competenceId,
    lastQuestionDate: new Date('2020-01-20'),
    state: 'started',
    lastChallengeId: 'challengePixA1C1Th1Tu1S2Ch1',
  });
  databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
  const { id: answerId } = databaseBuilder.factory.buildAnswer({
    challengeId: 'challengePixA1C1Th1Tu1S2Ch1',
    assessmentId,
    value: 'any good answer',
    result: 'ok',
  });
  databaseBuilder.factory.buildKnowledgeElement({
    status: StatusType.VALIDATED,
    skillId: 'skillPixA1C1Th1Tu1S2',
    assessmentId,
    answerId,
    userId,
    competenceId,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    source: SourceType.INFERRED,
    status: StatusType.VALIDATED,
    skillId: 'skillPixA1C1Th1Tu1S1',
    assessmentId,
    answerId,
    userId,
    competenceId,
  });
}

function _buildAssessmentWithAllSkillsAnswered(assessmentId, userId, latestChallengeAnsweredId) {
  const competenceId = 'competencePixA1C1';
  databaseBuilder.factory.buildUser({ id: userId });
  databaseBuilder.factory.buildAssessment({
    id: assessmentId,
    type: types.COMPETENCE_EVALUATION,
    userId,
    competenceId,
    lastQuestionDate: new Date('2020-01-20'),
    state: 'started',
    lastChallengeId: latestChallengeAnsweredId,
  });
  databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
  const { id: answerId } = databaseBuilder.factory.buildAnswer({
    challengeId: 'challengePixA1C1Th1Tu1S2Ch1',
    assessmentId,
    value: 'any good answer',
    result: 'ok',
  });
  databaseBuilder.factory.buildKnowledgeElement({
    status: StatusType.VALIDATED,
    skillId: 'skillPixA1C1Th1Tu1S2',
    assessmentId,
    answerId,
    userId,
    competenceId,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    source: SourceType.INFERRED,
    status: StatusType.VALIDATED,
    skillId: 'skillPixA1C1Th1Tu1S1',
    assessmentId,
    answerId,
    userId,
    competenceId,
  });
  const { id: answerId2 } = databaseBuilder.factory.buildAnswer({
    challengeId: 'challengePixA1C1Th1Tu1S3Ch1',
    assessmentId,
    value: 'any bad answer',
    result: 'ko',
  });
  databaseBuilder.factory.buildKnowledgeElement({
    status: StatusType.INVALIDATED,
    skillId: 'skillPixA1C1Th1Tu1S3',
    assessmentId,
    answerId: answerId2,
    userId,
    competenceId,
  });
}
