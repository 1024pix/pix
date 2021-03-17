const { expect, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const Stage = require('../../../../lib/domain/models/Stage');
const stageRepository = require('../../../../lib/infrastructure/repositories/stage-repository');
const _ = require('lodash');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | StageRepository', () => {

  describe('#findByCampaignId', () => {
    it('should retrieve stage given campaignId', async () => {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const campaign = databaseBuilder.factory.buildCampaign();

      databaseBuilder.factory.buildStage({ targetProfileId: campaign.targetProfileId, threshold: 24 });
      databaseBuilder.factory.buildStage({ targetProfileId: campaign.targetProfileId, threshold: 55 });

      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id });

      await databaseBuilder.commit();

      // when
      const stages = await stageRepository.findByCampaignId(campaign.id);

      // then
      expect(stages.length).to.equal(2);

      expect(stages[0].threshold).to.equal(24);
      expect(stages[1].threshold).to.equal(55);
    });
  });

  describe('#findByTargetProfileId', () => {
    it('should retrieve stage given targetProfileId', async () => {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const anotherTargetProfile = databaseBuilder.factory.buildTargetProfile();

      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id, threshold: 24 });
      databaseBuilder.factory.buildStage({ targetProfileId: anotherTargetProfile.id, threshold: 56 });

      await databaseBuilder.commit();

      // when
      const stages = await stageRepository.findByTargetProfileId(targetProfile.id);

      // then
      expect(stages.length).to.equal(1);
    });

    it('should retrieve stages sorted by threshold', async () => {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();

      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id, threshold: 24 });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id, threshold: 0 });

      await databaseBuilder.commit();

      // when
      const stages = await stageRepository.findByTargetProfileId(targetProfile.id);

      // then
      expect(stages.length).to.equal(2);
      expect(stages[0].threshold).to.equal(0);
    });
  });

  describe('#create', () => {
    let targetProfileId;

    beforeEach(async () => {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();

      await databaseBuilder.commit();

      targetProfileId = targetProfile.id;
    });

    afterEach(() => {
      return knex('stages').delete();
    });

    it('create a stage on a target profile', async () => {
      // given
      const stageToSave = {
        title: 'My title',
        message: 'My message',
        threshold: 42,
        targetProfileId,
      };

      // when
      const savedStage = await stageRepository.create(stageToSave);

      // then
      expect(savedStage).to.be.instanceof(Stage);
      expect(savedStage.id).to.exist;
      expect(savedStage).to.deep.include(_.pick(stageToSave, ['title', 'message', 'threshold']));
    });
  });

  describe('#updateStagePrescriberAttributes', () => {

    it('should update the stage with new data', async () => {
      // given
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
      const stage = databaseBuilder.factory.buildStage({ targetProfileId });

      await databaseBuilder.commit();

      // when
      stage.prescriberTitle = 'palier bof';
      stage.prescriberDescription = 'tu es moyen';
      await stageRepository.updateStagePrescriberAttributes(stage);

      // then
      expect(stage.prescriberTitle).to.equal('palier bof');
      expect(stage.prescriberDescription).to.equal('tu es moyen');
    });

    it('should update only one attribute', async () => {
      // given
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
      const stage = databaseBuilder.factory.buildStage({ targetProfileId });

      await databaseBuilder.commit();

      // when
      stage.prescriberTitle = 'palier bof';
      await stageRepository.updateStagePrescriberAttributes(stage);

      // then
      expect(stage.prescriberTitle).to.equal('palier bof');
      expect(stage.prescriberDescription).to.equal(null);
    });

    it('should not update the stage when the id is unknown and throw an error', async () => {
      // given
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
      const stage = databaseBuilder.factory.buildStage({ targetProfileId });
      await databaseBuilder.commit();

      // when
      stage.id = 999999;
      stage.prescriberTitle = 'palier bof';
      const error = await catchErr(stageRepository.updateStagePrescriberAttributes)(stage);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#get', () => {

    it('should get stage', async () => {
      // given
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildStage({ targetProfileId });
      databaseBuilder.factory.buildStage({ targetProfileId });
      databaseBuilder.factory.buildStage({ targetProfileId });
      const stage = databaseBuilder.factory.buildStage({ targetProfileId, id: 123456 });

      await databaseBuilder.commit();

      // when
      const expectedStage = await stageRepository.get(stage.id);

      // then
      expect(expectedStage.id).to.equal(stage.id);
      expect(expectedStage.message).to.equal(stage.message);
      expect(expectedStage.title).to.equal(stage.title);
    });

    it('should not find the stage when the id is unknown and throw an error', async () => {
      // given
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildStage({ targetProfileId });
      const unknownId = 999999999;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(stageRepository.get)(unknownId);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
