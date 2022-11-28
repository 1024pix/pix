const { expect, catchErr, databaseBuilder } = require('../../test-helper');
const {
  checkTrainingExistence,
  checkTargetProfileExistence,
} = require('../../../scripts/create-target-profile-trainings');

describe('Integration | Scripts | create-target-profile-trainings.js', function () {
  describe('#checkTrainingExistence', function () {
    it(`should throw an error when training doesn't exist`, async function () {
      // given
      const trainingId = 1;

      // when
      const error = await catchErr(checkTrainingExistence)(trainingId);

      // then
      expect(error).to.be.an.instanceof(Error);
      expect(error.message).to.be.equal(`Training ${trainingId} not found`);
    });

    it('should not throw an error if the training exists', async function () {
      // given
      const training = databaseBuilder.factory.buildTraining();
      await databaseBuilder.commit();

      // when
      expect(await checkTrainingExistence(training.id)).not.to.throw;
    });
  });

  describe('#checkTargetProfileExistence', function () {
    it(`should throw an error when targetProfile doesn't exist`, async function () {
      // given
      const targetProfileId = 1;

      // when
      const error = await catchErr(checkTargetProfileExistence)(targetProfileId);

      // then
      expect(error).to.be.an.instanceof(Error);
      expect(error.message).to.be.equal(`Target profile ${targetProfileId} not found`);
    });

    it('should not throw an error if the targetProfile exists', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      await databaseBuilder.commit();

      // when
      expect(await checkTargetProfileExistence(targetProfile.id)).not.to.throw;
    });
  });
});
