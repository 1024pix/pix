import { usecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { knex } from '../../../../tooling/databases.js';

describe('Integration | Devcomp | Domain | UseCases | save-user-campaign-survey', function () {
  context('when a UserCampaignSurvey with same "userId" and "campaignId" does not already exist', function () {
    it('should save a UserCampaignSurvey and return its id', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;

      const satisfactionScore = 4;

      await databaseBuilder.commit();

      // when
      const result = await usecases.saveUserCampaignSurvey({
        userId,
        campaignId,
        satisfactionScore,
      });

      // then
      expect(result).to.be.greaterThan(0);
    });
  });
  context('when a UserCampaignSurvey with same "userId" and "campaignId" already exist', function () {
    it('should update it', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;

      const satisfactionScore = 4;

      const expectedSurveyAnswers = {
        satisfactionScore: 5,
        usefulnessScore: 2,
        personalizationScore: 3,
        attractivenessScore: 4,
        comment: 'incroyable',
      };

      databaseBuilder.factory.buildUserCampaignSurvey({ userId, campaignId, satisfactionScore });

      await databaseBuilder.commit();

      // when
      const result = await usecases.saveUserCampaignSurvey({
        userId,
        campaignId,
        ...expectedSurveyAnswers,
      });

      const [userCampaignSurvey] = await knex('user-campaign-surveys').where({ userId, campaignId });
      // then
      expect(result).to.be.greaterThan(0);
      expect(userCampaignSurvey.survey).to.deep.equal(expectedSurveyAnswers);
    });
  });
});
