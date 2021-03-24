const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, mockLearningContent, learningContentBuilder, knex, sinon } = require('../../../test-helper');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

const competenceId = 'recCompetence';
const skillWeb1Id = 'recAcquisWeb1';
const skillWeb2Id = 'recAcquisWeb2';
const skillWeb3Id = 'recAcquisWeb3';

const firstChallengeId = 'recFirstChallenge';
const secondChallengeId = 'recSecondChallenge';
const thirdChallengeId = 'recThirdChallenge';
const otherChallengeId = 'recOtherChallenge';

const learningContent = [{
  id: 'recArea1',
  titleFrFr: 'area1_Title',
  color: 'someColor',
  competences: [{
    id: competenceId,
    nameFrFr: 'Mener une recherche et une veille d’information',
    index: '1.1',
    tubes: [{
      id: 'recTube0_0',
      skills: [{
        id: skillWeb2Id,
        nom: '@web2',
        challenges: [{ id: firstChallengeId }],
      }, {
        id: skillWeb3Id,
        nom: '@web3',
        challenges: [{ id: secondChallengeId, langues: ['Franco Français'] }],
      }, {
        id: skillWeb1Id,
        nom: '@web1',
        challenges: [{ id: thirdChallengeId }, { id: otherChallengeId }],
      }],
    }],
  }],
}];

describe('Acceptance | API | assessment-controller-get-next-challenge-for-competence-evaluation', function() {

  let server;

  beforeEach(async function() {
    server = await createServer();
    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);
  });

  describe('GET /api/assessments/:assessment_id/next', function() {

    const assessmentId = 1;
    const userId = 1234;

    context('When there is still challenges to answer', function() {
      let clock;

      beforeEach(async function() {
        databaseBuilder.factory.buildUser({ id: userId });
        databaseBuilder.factory.buildAssessment({ id: assessmentId, type: Assessment.types.COMPETENCE_EVALUATION, userId, competenceId, lastQuestionDate: new Date('2020-01-20') });
        const { id: answerId } = databaseBuilder.factory.buildAnswer({ challengeId: firstChallengeId, assessmentId, value: 'any good answer', result: 'ok' });
        databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
        databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId: skillWeb2Id,
          assessmentId,
          answerId,
          userId,
          competenceId,
        });
        await databaseBuilder.commit();

        clock = sinon.useFakeTimers({
          now: Date.now(),
          toFake: ['Date'],
        });
      });

      afterEach(async function() {
        clock.restore();
      });

      it('should return the second challenge if the first answer is correct', async function() {
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
        expect(response.result.data.id).to.equal(secondChallengeId);
      });
    });

    context('When there is no more challenges to answer', function() {
      beforeEach(async function() {
        databaseBuilder.factory.buildUser({ id: userId });
        databaseBuilder.factory.buildAssessment({ id: assessmentId, type: Assessment.types.COMPETENCE_EVALUATION, userId, competenceId });
        const { id: answerId1 } = databaseBuilder.factory.buildAnswer({ challengeId: firstChallengeId, assessmentId, value: 'any good answer', result: 'ok' });
        const { id: answerId2 } = databaseBuilder.factory.buildAnswer({ challengeId: secondChallengeId, assessmentId, value: 'any bad answer', result: 'ko' });
        databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
        databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId: skillWeb2Id,
          assessmentId,
          answerId1,
          userId,
          competenceId,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          source: KnowledgeElement.SourceType.INFERRED,
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId: skillWeb1Id,
          assessmentId,
          answerId1,
          userId,
          competenceId,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.INVALIDATED,
          skillId: skillWeb3Id,
          assessmentId,
          answerId2,
          userId,
          competenceId,
        });
        await databaseBuilder.commit();
      });

      it('should finish the test if there is no next challenge', async function() {
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
    });
  });
});
