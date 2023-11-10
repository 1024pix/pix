import _ from 'lodash';
import { expect, databaseBuilder, domainBuilder, knex } from '../../../../test-helper.js';
import * as stageCollectionRepository from '../../../../../src/evaluation/infrastructure/repositories/stage-collection-repository.js';
import { StageCollectionUpdate } from '../../../../../lib/domain/models/target-profile-management/StageCollectionUpdate.js';

describe('Integration | Infrastructure | Repository | target-profile-management | stage-collection-repository', function () {
  describe('#getByTargetProfileId', function () {
    context('when no stage exists in database', function () {
      it('should return an empty array', async function () {
        // given
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        await databaseBuilder.commit();

        // when
        const result = await stageCollectionRepository.getByTargetProfileId(targetProfileId);
        const savedStages = result.stages;

        // then
        expect(savedStages).to.deep.equal([]);
      });
    });

    context('when stage exists in database', function () {
      it('should return an existing stage', async function () {
        // given
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const stage = databaseBuilder.factory.buildStage({
          targetProfileId,
          threshold: 0,
        });
        await databaseBuilder.commit();

        // when
        const result = await stageCollectionRepository.getByTargetProfileId(targetProfileId);
        const savedStages = result.stages;

        // then
        expect(savedStages).to.have.lengthOf(1);
        expect(savedStages[0]).to.deep.equal(stage);
      });
    });
  });

  describe('#update', function () {
    it('should update an existing stage', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const firstStage = databaseBuilder.factory.buildStage({
        targetProfileId,
        threshold: 0,
        title: 'initial first stage title',
        message: '...',
        prescriberTitle: '...',
        prescriberDescription: '...',
      });
      const secondStage = databaseBuilder.factory.buildStage({
        targetProfileId,
        threshold: 10,
        title: '...',
        message: '...',
        prescriberTitle: '...',
        prescriberDescription: '...',
      });
      await databaseBuilder.commit();

      const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({
        id: targetProfileId,
        stages: [firstStage, secondStage],
      });

      const updatedFirstStage = { ...firstStage, title: 'updated title' };
      const stageCollectionUpdate = new StageCollectionUpdate({
        stagesDTO: [updatedFirstStage, secondStage],
        stageCollection,
      });

      // when
      await stageCollectionRepository.update(stageCollectionUpdate);

      // then
      const savedStages = await knex.from('stages');
      expect(_.omit(savedStages[0], ['createdAt', 'updatedAt'])).to.deep.equal(updatedFirstStage);
      expect(_.omit(savedStages[1], ['createdAt', 'updatedAt'])).to.deep.equal(secondStage);
    });

    it('should be possible to add a new stage', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const existingStage = databaseBuilder.factory.buildStage({
        targetProfileId,
        threshold: 0,
        prescriberTitle: '...',
        prescriberDescription: '...',
      });
      await databaseBuilder.commit();

      const newStage = domainBuilder.buildStage({
        id: null,
        targetProfileId,
        threshold: 10,
        title: 'New stage',
        prescriberTitle: '...',
        prescriberDescription: '...',
      });

      const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({
        id: targetProfileId,
        stages: [existingStage],
      });

      const stageCollectionUpdate = new StageCollectionUpdate({
        stagesDTO: [existingStage, newStage],
        stageCollection,
      });

      // when
      await stageCollectionRepository.update(stageCollectionUpdate);

      // then
      const savedStages = await knex.from('stages');
      expect(savedStages).to.have.lengthOf(2);
      expect(_.omit(savedStages[0], ['id', 'createdAt', 'updatedAt'])).to.deep.include(
        _.omit(newStage, ['id', 'campaignId']),
      );
      expect(_.omit(savedStages[1], ['createdAt', 'updatedAt'])).to.deep.include(existingStage);
    });

    it('should be possible to delete an existing stage', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const firstStage = databaseBuilder.factory.buildStage({
        targetProfileId,
        threshold: 0,
      });
      const secondStage = databaseBuilder.factory.buildStage({
        targetProfileId,
        threshold: 10,
      });
      await databaseBuilder.commit();

      const stageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({
        id: targetProfileId,
        stages: [firstStage, secondStage],
      });

      const stageCollectionUpdate = new StageCollectionUpdate({ stagesDTO: [firstStage], stageCollection });

      // when
      await stageCollectionRepository.update(stageCollectionUpdate);

      // then
      const savedStage = await knex.from('stages');
      expect(savedStage).to.have.lengthOf(1);
    });
  });
});
