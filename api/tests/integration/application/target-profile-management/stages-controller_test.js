const _ = require('lodash');
const { expect, hFake, databaseBuilder, knex } = require('../../../test-helper');
const stagesController = require('../../../../lib/application/target-profile-management/stages-controller');
const stageCollectionRepository = require('../../../../lib/infrastructure/repositories/target-profile-management/stage-collection-repository');

describe('Integration | Application | Target Profile Management | stages-controller', function () {
  describe('#create', function () {
    afterEach(async function () {
      return knex('stages').delete();
    });

    it('should add a stage level type to target profile', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, level: 6 });
      databaseBuilder.factory.buildStage({
        id: 1,
        targetProfileId,
        level: 0,
        threshold: null,
        title: 'palier titre',
        message: 'palier message',
        prescriberTitle: 'palier prescripteur titre',
        prescriberDescription: 'palier prescripteur description',
      });
      await databaseBuilder.commit();
      const request = {
        payload: {
          data: {
            attributes: {
              level: 3,
              title: 'nouveau palier titre',
              message: 'nouveau palier message',
            },
            relationships: {
              'target-profile': { data: { id: targetProfileId } },
            },
          },
        },
      };

      // when
      const response = await stagesController.create(request, hFake);

      // then
      const stageCollection = await stageCollectionRepository.getByTargetProfileId(targetProfileId);
      const [createdStageId] = _.difference(
        stageCollection.stages.map((stage) => stage.id),
        [1]
      );
      expect(response.statusCode).to.equal(201);
      expect(response.source.data).to.deep.equal({ type: 'stages', id: createdStageId.toString() });
      expect(stageCollection.stages).to.deep.equal([
        {
          id: 1,
          level: 0,
          targetProfileId,
          threshold: null,
          title: 'palier titre',
          message: 'palier message',
          prescriberTitle: 'palier prescripteur titre',
          prescriberDescription: 'palier prescripteur description',
        },
        {
          id: createdStageId,
          level: 3,
          threshold: null,
          targetProfileId,
          title: 'nouveau palier titre',
          message: 'nouveau palier message',
          prescriberTitle: null,
          prescriberDescription: null,
        },
      ]);
    });

    it('should add a stage threshold type to target profile', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildStage({
        id: 1,
        targetProfileId,
        level: null,
        threshold: 80,
        title: 'palier titre',
        message: 'palier message',
        prescriberTitle: 'palier prescripteur titre',
        prescriberDescription: 'palier prescripteur description',
      });
      await databaseBuilder.commit();
      const request = {
        payload: {
          data: {
            attributes: {
              level: null,
              threshold: 65,
              title: 'nouveau palier titre',
              message: 'nouveau palier message',
            },
            relationships: {
              'target-profile': { data: { id: targetProfileId } },
            },
          },
        },
      };

      // when
      const response = await stagesController.create(request, hFake);

      // then
      const stageCollection = await stageCollectionRepository.getByTargetProfileId(targetProfileId);
      const [createdStageId] = _.difference(
        stageCollection.stages.map((stage) => stage.id),
        [1]
      );
      expect(response.statusCode).to.equal(201);
      expect(response.source.data).to.deep.equal({ type: 'stages', id: createdStageId.toString() });
      expect(stageCollection.stages).to.deep.equal([
        {
          id: 1,
          level: null,
          targetProfileId,
          threshold: 80,
          title: 'palier titre',
          message: 'palier message',
          prescriberTitle: 'palier prescripteur titre',
          prescriberDescription: 'palier prescripteur description',
        },
        {
          id: createdStageId,
          level: null,
          threshold: 65,
          targetProfileId,
          title: 'nouveau palier titre',
          message: 'nouveau palier message',
          prescriberTitle: null,
          prescriberDescription: null,
        },
      ]);
    });
  });

  describe('#update', function () {
    afterEach(async function () {
      return knex('stages').delete();
    });

    it('should update a stage level type', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, level: 6 });
      databaseBuilder.factory.buildStage({
        id: 1,
        targetProfileId,
        level: 0,
        threshold: null,
        title: 'palier titre',
        message: 'palier message',
        prescriberTitle: 'palier prescripteur titre',
        prescriberDescription: 'palier prescripteur description',
      });
      databaseBuilder.factory.buildStage({
        id: 2,
        targetProfileId,
        level: 3,
        threshold: null,
        title: 'ancien palier titre',
        message: 'ancien palier message',
        prescriberTitle: 'ancien palier prescripteur titre',
        prescriberDescription: 'ancien palier prescripteur description',
      });
      await databaseBuilder.commit();
      const request = {
        payload: {
          data: {
            id: 2,
            attributes: {
              level: 6,
              title: 'nouveau palier titre',
              message: 'nouveau palier message',
              'prescriber-title': 'nouveau palier prescripteur titre',
              'prescriber-description': 'nouveau palier prescripteur description',
            },
            relationships: {
              'target-profile': { data: { id: targetProfileId } },
            },
          },
        },
      };

      // when
      const response = await stagesController.update(request, hFake);

      // then
      const stageCollection = await stageCollectionRepository.getByTargetProfileId(targetProfileId);
      expect(response.statusCode).to.equal(204);
      expect(stageCollection.stages).to.deep.equal([
        {
          id: 1,
          level: 0,
          targetProfileId,
          threshold: null,
          title: 'palier titre',
          message: 'palier message',
          prescriberTitle: 'palier prescripteur titre',
          prescriberDescription: 'palier prescripteur description',
        },
        {
          id: 2,
          level: 6,
          targetProfileId,
          threshold: null,
          title: 'nouveau palier titre',
          message: 'nouveau palier message',
          prescriberTitle: 'nouveau palier prescripteur titre',
          prescriberDescription: 'nouveau palier prescripteur description',
        },
      ]);
    });
    it('should update a stage threshold type', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, level: 6 });
      databaseBuilder.factory.buildStage({
        id: 1,
        targetProfileId,
        level: null,
        threshold: 80,
        title: 'palier titre',
        message: 'palier message',
        prescriberTitle: 'palier prescripteur titre',
        prescriberDescription: 'palier prescripteur description',
      });
      databaseBuilder.factory.buildStage({
        id: 2,
        targetProfileId,
        level: null,
        threshold: 10,
        title: 'ancien palier titre',
        message: 'ancien palier message',
        prescriberTitle: 'ancien palier prescripteur titre',
        prescriberDescription: 'ancien palier prescripteur description',
      });
      await databaseBuilder.commit();
      const request = {
        payload: {
          data: {
            id: 2,
            attributes: {
              threshold: 50,
              title: 'nouveau palier titre',
              message: 'nouveau palier message',
              'prescriber-title': 'nouveau palier prescripteur titre',
              'prescriber-description': 'nouveau palier prescripteur description',
            },
            relationships: {
              'target-profile': { data: { id: targetProfileId } },
            },
          },
        },
      };

      // when
      const response = await stagesController.update(request, hFake);

      // then
      const stageCollection = await stageCollectionRepository.getByTargetProfileId(targetProfileId);
      expect(response.statusCode).to.equal(204);
      expect(stageCollection.stages).to.deep.equal([
        {
          id: 1,
          level: null,
          targetProfileId,
          threshold: 80,
          title: 'palier titre',
          message: 'palier message',
          prescriberTitle: 'palier prescripteur titre',
          prescriberDescription: 'palier prescripteur description',
        },
        {
          id: 2,
          level: null,
          targetProfileId,
          threshold: 50,
          title: 'nouveau palier titre',
          message: 'nouveau palier message',
          prescriberTitle: 'nouveau palier prescripteur titre',
          prescriberDescription: 'nouveau palier prescripteur description',
        },
      ]);
    });
  });

  describe('#delete', function () {
    afterEach(async function () {
      return knex('stages').delete();
    });

    it('should delete given stage', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, level: 6 });
      databaseBuilder.factory.buildStage({
        id: 1,
        targetProfileId,
        level: 0,
        threshold: null,
        title: 'palier titre',
        message: 'palier message',
        prescriberTitle: 'palier prescripteur titre',
        prescriberDescription: 'palier prescripteur description',
      });
      databaseBuilder.factory.buildStage({
        id: 2,
        targetProfileId,
        level: 3,
        threshold: null,
        title: 'ancien palier titre',
        message: 'ancien palier message',
        prescriberTitle: 'ancien palier prescripteur titre',
        prescriberDescription: 'ancien palier prescripteur description',
      });
      await databaseBuilder.commit();
      const request = {
        params: {
          id: 2,
        },
        payload: {
          data: {
            id: 2,
            attributes: {
              level: 6,
              targetProfileId,
              title: 'nouveau palier titre',
              message: 'nouveau palier message',
              'prescriber-title': 'nouveau palier prescripteur titre',
              'prescriber-description': 'nouveau palier prescripteur description',
            },
            relationships: {
              'target-profile': { data: { id: targetProfileId } },
            },
          },
        },
      };

      // when
      const response = await stagesController.delete(request, hFake);

      // then
      const stageCollection = await stageCollectionRepository.getByTargetProfileId(targetProfileId);
      expect(response.statusCode).to.equal(204);
      expect(stageCollection.stages).to.deep.equal([
        {
          id: 1,
          level: 0,
          targetProfileId,
          threshold: null,
          title: 'palier titre',
          message: 'palier message',
          prescriberTitle: 'palier prescripteur titre',
          prescriberDescription: 'palier prescripteur description',
        },
      ]);
    });
  });
});
