const _ = require('lodash');
const { expect, databaseBuilder, knex } = require('../../../test-helper');
const userRecommendedTrainingRepository = require('../../../../lib/infrastructure/repositories/user-recommended-training-repository');

describe('Integration | Repository | user-recommended-training-repository', function () {
  afterEach(async function () {
    await knex('user-recommended-trainings').delete();
  });

  describe('#save', function () {
    it('should persist userRecommendedTraining', async function () {
      // given
      const userRecommendedTraining = {
        userId: databaseBuilder.factory.buildUser().id,
        trainingId: databaseBuilder.factory.buildTraining().id,
        campaignParticipationId: databaseBuilder.factory.buildCampaignParticipation().id,
      };
      await databaseBuilder.commit();

      // when
      await userRecommendedTrainingRepository.save(userRecommendedTraining);

      // then
      const persistedUserRecommendedTraining = await knex('user-recommended-trainings')
        .where({
          userId: userRecommendedTraining.userId,
          trainingId: userRecommendedTraining.trainingId,
          campaignParticipationId: userRecommendedTraining.campaignParticipationId,
        })
        .first();
      expect(_.omit(persistedUserRecommendedTraining, ['id', 'createdAt', 'updatedAt'])).to.deep.equal(
        userRecommendedTraining
      );
    });
  });
});
