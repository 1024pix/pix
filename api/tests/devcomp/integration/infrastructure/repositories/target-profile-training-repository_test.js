import sinon from 'sinon';

import * as targetProfileTrainingRepository from '../../../../../src/devcomp/infrastructure/repositories/target-profile-training-repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Repository | target-profile-training-repository', function () {
  let clock;
  let now;

  beforeEach(function () {
    now = new Date('2022-02-13');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(async function () {
    clock.restore();
  });

  describe('#create', function () {
    it('should create a target-profile-training for given training and given target profile', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ id: 1 });
      const anotherTargetProfile = databaseBuilder.factory.buildTargetProfile({ id: 2 });
      const training = databaseBuilder.factory.buildTraining({ id: 1 });
      await databaseBuilder.commit();

      // when
      const createdTargetProfileTrainingIds = await targetProfileTrainingRepository.create({
        trainingId: training.id,
        targetProfileIds: [targetProfile.id, anotherTargetProfile.id],
      });

      // then
      expect(createdTargetProfileTrainingIds).to.be.an('array');
      expect(createdTargetProfileTrainingIds[0]).to.equal(targetProfile.id);
    });

    it('sould not create duplicates if tuple targetProfileId and trainingId already exists', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ id: 1 });
      const anotherTargetProfile = databaseBuilder.factory.buildTargetProfile({ id: 2 });
      const training = databaseBuilder.factory.buildTraining({ id: 1 });
      databaseBuilder.factory.buildTargetProfileTraining({
        targetProfileId: targetProfile.id,
        trainingId: training.id,
      });
      await databaseBuilder.commit();

      // when
      await targetProfileTrainingRepository.create({
        trainingId: training.id,
        targetProfileIds: [targetProfile.id, anotherTargetProfile.id],
      });

      const exisitingTargetProfileTraining = await databaseBuilder.knex('target-profile-trainings').select();
      // then
      expect(exisitingTargetProfileTraining).to.be.lengthOf(2);
      expect(exisitingTargetProfileTraining[1].targetProfileId).to.equal(anotherTargetProfile.id);
      expect(exisitingTargetProfileTraining[0].updatedAt).to.deep.equal(now);
    });
  });

  describe('#remove', function () {
    it('should return true when training/target-profile is removed', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const training = databaseBuilder.factory.buildTraining();
      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training.id,
        targetProfileId: targetProfile.id,
      });
      await databaseBuilder.commit();

      // when
      const removedResult = await targetProfileTrainingRepository.remove({
        trainingId: training.id,
        targetProfileId: targetProfile.id,
      });

      // then
      expect(removedResult).to.be.true;
    });

    it('should return false when training/target-profile is not found', async function () {
      // when
      const removedResult = await targetProfileTrainingRepository.remove({
        trainingId: 1,
        targetProfileId: 2,
      });

      // then
      expect(removedResult).to.be.false;
    });
  });

  describe('#get', function () {
    describe('when found', function () {
      it('should return training/target-profile', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const training = databaseBuilder.factory.buildTraining();
        const expectedTargetProfileTraining = databaseBuilder.factory.buildTargetProfileTraining({
          id: 8000,
          trainingId: training.id,
          targetProfileId: targetProfile.id,
          createdAt: now,
          updatedAt: now,
        });
        await databaseBuilder.commit();

        // when
        const getResult = await targetProfileTrainingRepository.get({
          trainingId: training.id,
          targetProfileId: targetProfile.id,
        });

        // then
        expect(getResult).to.deep.equal(expectedTargetProfileTraining);
      });
    });

    describe('when not found', function () {
      it('should return null', async function () {
        // when
        const getResult = await targetProfileTrainingRepository.get({
          trainingId: 1,
          targetProfileId: 2,
        });

        // then
        expect(getResult).to.be.undefined;
      });
    });
  });
});
