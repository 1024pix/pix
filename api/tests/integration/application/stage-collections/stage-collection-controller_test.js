const { expect, knex, databaseBuilder, hFake } = require('../../../test-helper');
const controller = require('../../../../lib/application/stage-collections/stage-collection-controller');
const stageCollectionRepository = require('../../../../lib/infrastructure/repositories/target-profile-management/stage-collection-repository');

describe('Integration | Application | stage-collection-controller', function () {
  context('update', function () {
    afterEach(async function () {
      await knex('stages').delete();
    });

    it('should modify stage collection according to the request', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, level: 5 });
      databaseBuilder.factory.buildStage({
        id: 123,
        targetProfileId,
        isFirstSkill: false,
        level: 0,
        threshold: null,
        title: 'Palier niveau 0 titre',
        message: 'Palier niveau 0 message',
        prescriberTitle: 'Palier niveau 0 titre prescripteur',
        prescriberDescription: 'Palier niveau 0 description prescripteur',
      });
      databaseBuilder.factory.buildStage({
        id: 456,
        targetProfileId,
        isFirstSkill: false,
        level: 1,
        threshold: null,
        title: 'Palier niveau 1 MAUVAIS titre',
        message: 'Palier niveau 1 MAUVAIS message',
        prescriberTitle: 'Palier niveau 1 MAUVAIS titre prescripteur',
        prescriberDescription: 'Palier niveau 1 MAUVAIS description prescripteur',
      });
      databaseBuilder.factory.buildStage({
        id: 789,
        targetProfileId,
        isFirstSkill: false,
        level: 3,
        threshold: null,
        title: 'Palier niveau 3 titre',
        message: 'Palier niveau 3 message',
        prescriberTitle: 'Palier niveau 3 titre prescripteur',
        prescriberDescription: 'Palier niveau 3 description prescripteur',
      });
      await databaseBuilder.commit();
      const request = {
        params: {
          id: targetProfileId,
        },
        payload: {
          data: {
            attributes: {
              stages: [
                {
                  id: 123,
                  level: 0,
                  threshold: null,
                  title: 'Palier niveau 0 titre',
                  message: 'Palier niveau 0 message',
                  prescriberTitle: 'Palier niveau 0 titre prescripteur',
                  prescriberDescription: 'Palier niveau 0 description prescripteur',
                },
                {
                  id: 456,
                  level: 1,
                  threshold: null,
                  title: 'Palier niveau 1 titre',
                  message: 'Palier niveau 1 message',
                  prescriberTitle: 'Palier niveau 1 titre prescripteur',
                  prescriberDescription: 'Palier niveau 1 description prescripteur',
                },
                {
                  id: null,
                  level: 2,
                  threshold: null,
                  title: 'Palier niveau 2 titre',
                  message: 'Palier niveau 2 message',
                  prescriberTitle: 'Palier niveau 2 titre prescripteur',
                  prescriberDescription: 'Palier niveau 2 description prescripteur',
                },
              ],
            },
          },
        },
      };

      // when
      await controller.update(request, hFake);

      // then
      const currentStageCollection = await stageCollectionRepository.getByTargetProfileId(targetProfileId);
      const newStageId = currentStageCollection.stages
        .map(({ id }) => id)
        .filter((value) => ![123, 456, 789].includes(value))[0];
      expect(currentStageCollection.toDTO()).to.deep.equal({
        id: targetProfileId,
        targetProfileId,
        stages: [
          {
            id: newStageId,
            level: 2,
            threshold: null,
            title: 'Palier niveau 2 titre',
            message: 'Palier niveau 2 message',
            prescriberTitle: 'Palier niveau 2 titre prescripteur',
            prescriberDescription: 'Palier niveau 2 description prescripteur',
          },
          {
            id: 123,
            level: 0,
            threshold: null,
            title: 'Palier niveau 0 titre',
            message: 'Palier niveau 0 message',
            prescriberTitle: 'Palier niveau 0 titre prescripteur',
            prescriberDescription: 'Palier niveau 0 description prescripteur',
          },
          {
            id: 456,
            level: 1,
            threshold: null,
            title: 'Palier niveau 1 titre',
            message: 'Palier niveau 1 message',
            prescriberTitle: 'Palier niveau 1 titre prescripteur',
            prescriberDescription: 'Palier niveau 1 description prescripteur',
          },
        ],
      });
    });
  });
});
