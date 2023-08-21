import { expect, databaseBuilder, knex } from '../../../test-helper.js';
import {
  getByCampaignIds,
  getByCampaignId,
  getByCampaignParticipationId,
} from '../../../../lib/infrastructure/repositories/stage-repository.js';
import { Stage } from '../../../../lib/domain/models/Stage.js';
describe('Integration | Repository | Stage Acquisition', function () {
  describe('getByCampaignIds', function () {
    let campaigns;
    let stages;

    beforeEach(async function () {
      campaigns = [databaseBuilder.factory.buildCampaign(), databaseBuilder.factory.buildCampaign()];
      stages = [
        databaseBuilder.factory.buildStage({ targetProfileId: campaigns[0].targetProfileId }),
        databaseBuilder.factory.buildStage({ targetProfileId: campaigns[1].targetProfileId, threshold: 20 }),
        databaseBuilder.factory.buildStage({ targetProfileId: campaigns[1].targetProfileId, threshold: 10 }),
      ];

      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('stages').delete();
    });

    it('should return Stage instances', async function () {
      const result = await getByCampaignIds(campaigns.map((campaign) => campaign.id));
      expect(result[0]).to.be.instanceof(Stage);
    });

    it('should return the expected stages', async function () {
      const result = await getByCampaignIds(campaigns.map((campaign) => campaign.id));
      expect(result.length).to.deep.equal(3);
    });

    it('should sort stages by threshold', async function () {
      const result = await getByCampaignIds(campaigns.map((campaign) => campaign.id));
      expect(result[1].id).to.deep.equal(stages[2].id);
    });
  });

  describe('getByCampaignId', function () {
    let campaign;
    let stages;

    beforeEach(async function () {
      campaign = databaseBuilder.factory.buildCampaign();
      stages = [
        databaseBuilder.factory.buildStage({ targetProfileId: campaign.targetProfileId, threshold: 40 }),
        databaseBuilder.factory.buildStage({ targetProfileId: campaign.targetProfileId, threshold: 20 }),
        databaseBuilder.factory.buildStage({ targetProfileId: campaign.targetProfileId, threshold: 10 }),
      ];

      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('stages').delete();
    });

    it('should return Stage instances', async function () {
      const result = await getByCampaignId(campaign.id);
      expect(result[0]).to.be.instanceof(Stage);
    });

    it('should return the expected stages', async function () {
      const result = await getByCampaignId(campaign.id);
      expect(result.length).to.deep.equal(3);
    });

    it('should sort stages by threshold', async function () {
      const result = await getByCampaignId(campaign.id);
      expect(result[0].id).to.deep.equal(stages[2].id);
    });
  });

  describe('getByCampaignParticipationId', function () {
    let campaign;
    let stages;
    let campaignParticipation;

    beforeEach(async function () {
      campaign = databaseBuilder.factory.buildCampaign();
      stages = [
        databaseBuilder.factory.buildStage({ targetProfileId: campaign.targetProfileId, threshold: 40 }),
        databaseBuilder.factory.buildStage({ targetProfileId: campaign.targetProfileId, threshold: 10 }),
        databaseBuilder.factory.buildStage({ targetProfileId: campaign.targetProfileId, threshold: 20 }),
      ];
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign.id });

      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('stages').delete();
    });

    it('should return Stage instances', async function () {
      const result = await getByCampaignParticipationId(campaignParticipation.id);
      expect(result[0]).to.be.instanceof(Stage);
    });

    it('should return the expected stages', async function () {
      const result = await getByCampaignParticipationId(campaignParticipation.id);
      expect(result.length).to.deep.equal(3);
    });

    it('should sort stages by threshold', async function () {
      const result = await getByCampaignParticipationId(campaignParticipation.id);
      expect(result[0].id).to.deep.equal(stages[1].id);
    });
  });
});
