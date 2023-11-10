import { expect, databaseBuilder, catchErr } from '../../../../test-helper.js';
import {
  get,
  getByCampaignIds,
  getByCampaignId,
  getByCampaignParticipationId,
  getByTargetProfileIds,
  update,
} from '../../../../lib/infrastructure/repositories/stage-repository.js';
import { Stage } from '../../../../../src/evaluation/domain/models/Stage.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

describe('Integration | Repository | Stage Acquisition', function () {
  describe('get', function () {
    it('should return a stage for a given id', async function () {
      // given
      const stage1 = databaseBuilder.factory.buildStage({ id: 1 });
      databaseBuilder.factory.buildStage({ id: 2 });
      await databaseBuilder.commit();

      // when
      const stage = await get(1);

      // then
      expect(stage).to.be.instanceOf(Stage);
      expect(stage).to.deep.equal(stage1);
    });

    context('when the stage does not exist', function () {
      it('should throw a not found message error', async function () {
        // given
        databaseBuilder.factory.buildStage({ id: 1 });
        await databaseBuilder.commit();

        // when
        const notExistingStageId = 9999;
        const error = await catchErr(get)(notExistingStageId);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Erreur, palier introuvable');
      });
    });
  });

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

    it('should return Stage instances', async function () {
      const result = await getByCampaignParticipationId(campaignParticipation.id);
      expect(result[0]).to.be.instanceof(Stage);
    });

    it('should return the expected stages', async function () {
      const result = await getByCampaignParticipationId(campaignParticipation.id);
      expect(result).to.have.deep.members(stages);
    });

    it('should sort stages by threshold', async function () {
      const result = await getByCampaignParticipationId(campaignParticipation.id);
      expect(result[0].id).to.equal(stages[1].id);
    });
  });

  describe('getByTargetProfileIds', function () {
    let targetProfile1;
    let targetProfile2;
    let stages;

    beforeEach(async function () {
      targetProfile1 = databaseBuilder.factory.buildTargetProfile();
      targetProfile2 = databaseBuilder.factory.buildTargetProfile();

      stages = [
        databaseBuilder.factory.buildStage({ targetProfileId: targetProfile1.id, threshold: 40 }),
        databaseBuilder.factory.buildStage({ targetProfileId: targetProfile1.id, threshold: 10 }),

        databaseBuilder.factory.buildStage({ targetProfileId: targetProfile2.id, threshold: 10 }),
        databaseBuilder.factory.buildStage({ targetProfileId: targetProfile2.id, threshold: 30 }),
        databaseBuilder.factory.buildStage({ targetProfileId: targetProfile2.id, threshold: 40 }),
      ];

      await databaseBuilder.commit();
    });

    it('should return Stage instances', async function () {
      const result = await getByTargetProfileIds([targetProfile1.id, targetProfile2.id]);
      expect(result[0]).to.be.instanceof(Stage);
    });

    it('should return the expected stages', async function () {
      const result = await getByTargetProfileIds([targetProfile1.id, targetProfile2.id]);
      expect(result).to.have.deep.members(stages);
    });
  });

  describe('update', function () {
    it('should update the stage', async function () {
      // given
      const stage = databaseBuilder.factory.buildStage({
        level: 1,
        title: 'Initial title',
        message: 'Initial message',
        prescriberTitle: 'Initial prescriber title',
        prescriberDescription: 'Initial prescriber description',
      });
      const anotherStage = databaseBuilder.factory.buildStage();

      await databaseBuilder.commit();

      const payload = {
        id: stage.id,
        attributesToUpdate: {
          level: 3,
          title: 'New title',
          message: 'New message',
          prescriberTitle: 'New prescriber title',
          prescriberDescription: 'New prescriber description',
        },
      };

      // when
      const updatedStage = await update(payload);

      // then
      expect(updatedStage).to.be.instanceOf(Stage);
      expect(updatedStage.level).equal(payload.attributesToUpdate.level);
      expect(updatedStage.title).equal(payload.attributesToUpdate.title);
      expect(updatedStage.message).equal(payload.attributesToUpdate.message);
      expect(updatedStage.prescriberTitle).equal(payload.attributesToUpdate.prescriberTitle);
      expect(updatedStage.prescriberDescription).equal(payload.attributesToUpdate.prescriberDescription);
      expect(anotherStage.title).to.not.equal(payload.attributesToUpdate.title);
    });
  });
});
