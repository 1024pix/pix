import { expect, databaseBuilder, sinon } from '../../../test-helper.js';
import * as targetProfileTrainingRepository from '../../../../lib/infrastructure/repositories/target-profile-training-repository.js';

describe('Integration | Repository | target-profile-training-repository', function () {
  describe('#create', function () {
    let clock;
    let now;

    beforeEach(function () {
      now = new Date('2022-02-13');
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

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
});
