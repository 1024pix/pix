import { UserCampaignSurvey } from '../../../../../src/devcomp/domain/models/UserCampaignSurvey.js';
import * as userCampaignSurveyRepository from '../../../../../src/devcomp/infrastructure/repositories/user-campaign-survey-repository.js';
import { AlreadyExistingEntityError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Infrastructure | Repository | userCampaignSurveyRepository', function () {
  let userId, campaignId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    campaignId = databaseBuilder.factory.buildCampaign().id;
    await databaseBuilder.commit();
  });

  describe('#save', function () {
    it('should store the survey in the database', async function () {
      // given
      const survey = new UserCampaignSurvey({ userId, campaignId, satisfactionScore: 4 });

      // when
      await userCampaignSurveyRepository.save(survey);

      // then
      const rows = await knex('user-campaign-surveys').where({ userId, campaignId });
      expect(rows).to.have.lengthOf(1);
      expect(rows[0].satisfactionScore).to.equal(4);
    });

    it('should return the created id', async function () {
      // given
      const anotherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUserCampaignSurvey({ userId: anotherUserId, campaignId, satisfactionScore: 3 });
      await databaseBuilder.commit();

      const survey = new UserCampaignSurvey({ userId, campaignId, satisfactionScore: 2 });

      // when
      const id = await userCampaignSurveyRepository.save(survey);

      // then
      const row = await knex('user-campaign-surveys').where({ id }).first();
      expect(row).to.exist;
      expect(row.userId).to.equal(userId);
      expect(row.campaignId).to.equal(campaignId);
      expect(row.satisfactionScore).to.equal(2);
    });

    context('when the user has already answered the survey for this campaign', function () {
      it('should throw an error', async function () {
        // given
        databaseBuilder.factory.buildUserCampaignSurvey({ userId, campaignId, satisfactionScore: 3 });
        await databaseBuilder.commit();

        const survey = new UserCampaignSurvey({ userId, campaignId, satisfactionScore: 4 });

        // when
        const error = await catchErr(userCampaignSurveyRepository.save)(survey);

        // then
        expect(error).to.be.instanceOf(AlreadyExistingEntityError);
      });
    });
  });
});
