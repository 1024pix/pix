const {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  LearningContentMock,
  knex,
  sinon,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const Assessment = require('../../../../lib/domain/models/Assessment');

const competenceId = 'competencePixA1C1';
const challengeId = 'challengePixA1C1Th1Tu1S1Ch1';

describe('Acceptance | API | assessment-controller-get-next-challenge-for-campaign-assessment', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    LearningContentMock.mockCommon();
  });

  describe('GET /api/assessments/:assessment_id/next', function () {
    const assessmentId = 1;
    const userId = 1234;

    context('When there is still challenges to answer', function () {
      let clock;

      beforeEach(async function () {
        databaseBuilder.factory.buildUser({ id: userId });
        const campaign = databaseBuilder.factory.buildCampaign({ assessmentMethod: 'FLASH' });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
        });
        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: Assessment.types.CAMPAIGN,
          userId,
          campaignParticipationId: campaignParticipation.id,
          lastQuestionDate: new Date('2020-01-20'),
          state: 'started',
          method: 'FLASH',
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

      it('should return a challenge', async function () {
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
        expect(response.result.data.id).to.equal(challengeId);
      });
    });
  });
});
