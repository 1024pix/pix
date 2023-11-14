import { expect, databaseBuilder, mockLearningContent, hFake } from '../../../../test-helper.js';
import { stageCollectionController } from '../../../../../src/evaluation/application/stage-collections/stage-collection-controller.js';
import * as stageCollectionRepository from '../../../../../src/evaluation/infrastructure/repositories/stage-collection-repository.js';

describe('Integration | Application | stage-collection-controller', function () {
  context('update', function () {
    beforeEach(function () {
      const learningContent = {
        areas: [],
        competences: [],
        thematics: [],
        tubes: [{ id: 'tubeId1' }],
      };
      mockLearningContent(learningContent);
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
                  id: '456',
                  level: 1,
                  threshold: null,
                  isFirstSkill: false,
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
                {
                  id: null,
                  level: null,
                  threshold: null,
                  isFirstSkill: true,
                  title: 'Palier premier acquis titre',
                  message: 'Palier premier acquis message',
                  prescriberTitle: 'Palier premier acquis titre prescripteur',
                  prescriberDescription: 'Palier premier acquis description prescripteur',
                },
              ],
            },
          },
        },
      };

      // when
      await stageCollectionController.update(request, hFake);

      // then
      const currentStageCollection = await stageCollectionRepository.getByTargetProfileId(targetProfileId);
      const currentStages = currentStageCollection.toDTO();
      const newStageIds = currentStageCollection.stages
        .map(({ id }) => id)
        .filter((value) => ![123, 456, 789].includes(value))
        .sort();

      expect(currentStages.id).to.equal(targetProfileId);
      expect(currentStages.targetProfileId).to.equal(targetProfileId);
      expect(currentStages.stages).to.have.deep.members([
        {
          id: newStageIds[0],
          level: 2,
          threshold: null,
          isFirstSkill: false,
          title: 'Palier niveau 2 titre',
          message: 'Palier niveau 2 message',
          prescriberTitle: 'Palier niveau 2 titre prescripteur',
          prescriberDescription: 'Palier niveau 2 description prescripteur',
        },
        {
          id: newStageIds[1],
          level: null,
          threshold: null,
          isFirstSkill: true,
          title: 'Palier premier acquis titre',
          message: 'Palier premier acquis message',
          prescriberTitle: 'Palier premier acquis titre prescripteur',
          prescriberDescription: 'Palier premier acquis description prescripteur',
        },
        {
          id: 123,
          level: 0,
          threshold: null,
          isFirstSkill: false,
          title: 'Palier niveau 0 titre',
          message: 'Palier niveau 0 message',
          prescriberTitle: 'Palier niveau 0 titre prescripteur',
          prescriberDescription: 'Palier niveau 0 description prescripteur',
        },
        {
          id: 456,
          level: 1,
          threshold: null,
          isFirstSkill: false,
          title: 'Palier niveau 1 titre',
          message: 'Palier niveau 1 message',
          prescriberTitle: 'Palier niveau 1 titre prescripteur',
          prescriberDescription: 'Palier niveau 1 description prescripteur',
        },
      ]);
    });
  });
});
