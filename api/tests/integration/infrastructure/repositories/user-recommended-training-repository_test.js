import _ from 'lodash';
import { expect, databaseBuilder, knex } from '../../../test-helper';
import userRecommendedTrainingRepository from '../../../../lib/infrastructure/repositories/user-recommended-training-repository';
import UserRecommendedTraining from '../../../../lib/domain/read-models/UserRecommendedTraining';

describe('Integration | Repository | user-recommended-training-repository', function () {
  describe('#save', function () {
    afterEach(async function () {
      await knex('user-recommended-trainings').delete();
    });

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

    it('should not throw an error on userRecommendedTraining conflict', async function () {
      // given
      const userRecommendedTraining = databaseBuilder.factory.buildUserRecommendedTraining({
        userId: databaseBuilder.factory.buildUser().id,
        trainingId: databaseBuilder.factory.buildTraining().id,
        campaignParticipationId: databaseBuilder.factory.buildCampaignParticipation().id,
        updatedAt: new Date('2022-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const saveSameUserRecommendedTraining = async () => {
        return userRecommendedTrainingRepository.save(userRecommendedTraining);
      };

      // then
      expect(await saveSameUserRecommendedTraining()).not.to.throw;
      const updatedUserRecommendedTraining = await knex('user-recommended-trainings')
        .where({
          id: userRecommendedTraining.id,
        })
        .first();
      expect(updatedUserRecommendedTraining.updatedAt).to.be.above(userRecommendedTraining.updatedAt);
    });
  });

  describe('#findByCampaignParticipationId', function () {
    it('should return saved recommended trainings for given campaignParticipationId and locale', async function () {
      // given
      const { id: campaignParticipationId, userId } = databaseBuilder.factory.buildCampaignParticipation();
      const training = databaseBuilder.factory.buildTraining();
      const userRecommendedTraining1 = {
        userId,
        trainingId: training.id,
        campaignParticipationId,
      };
      const userRecommendedTraining2 = {
        userId,
        trainingId: databaseBuilder.factory.buildTraining().id,
        campaignParticipationId,
      };
      const userRecommendedTrainingWithAnotherLocale = {
        userId,
        trainingId: databaseBuilder.factory.buildTraining({ locale: 'en-gb' }).id,
        campaignParticipationId,
      };
      const anotherCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation();
      const anotherUserRecommendedTraining = {
        userId: anotherCampaignParticipation.userId,
        trainingId: databaseBuilder.factory.buildTraining().id,
        campaignParticipationId: anotherCampaignParticipation.id,
      };
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTraining1);
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTraining2);
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTrainingWithAnotherLocale);
      databaseBuilder.factory.buildUserRecommendedTraining(anotherUserRecommendedTraining);
      await databaseBuilder.commit();

      // when
      const result = await userRecommendedTrainingRepository.findByCampaignParticipationId({
        campaignParticipationId,
        locale: 'fr-fr',
      });

      // then
      expect(result.length).to.equal(2);
      expect(result[0]).to.be.instanceOf(UserRecommendedTraining);
      expect(result[0]).to.deep.equal(new UserRecommendedTraining({ ...training, duration: { hours: 6 } }));
    });

    it('should return an empty array when user has no recommended training for this campaignParticipation', async function () {
      // given
      const { id: campaignParticipationId, userId } = databaseBuilder.factory.buildCampaignParticipation();
      const anotherCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation();
      const userRecommendedTraining = {
        userId,
        trainingId: databaseBuilder.factory.buildTraining().id,
        campaignParticipationId,
      };
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTraining);
      await databaseBuilder.commit();

      // when
      const result = await userRecommendedTrainingRepository.findByCampaignParticipationId({
        campaignParticipationId: anotherCampaignParticipation.id,
        locale: 'fr-fr',
      });

      // then
      expect(result.length).to.equal(0);
    });
  });
  describe('#hasRecommendedTrainings', function () {
    it('should return true if the user has recommended trainings', async function () {
      // given
      const { id: campaignParticipationId, userId } = databaseBuilder.factory.buildCampaignParticipation();
      const training = databaseBuilder.factory.buildTraining();
      const userRecommendedTraining1 = {
        userId,
        trainingId: training.id,
        campaignParticipationId,
      };

      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTraining1);

      await databaseBuilder.commit();

      // when
      const result = await userRecommendedTrainingRepository.hasRecommendedTrainings(userId);

      // then
      expect(result).to.equal(true);
    });

    it('should return false if the user has no recommended trainings', async function () {
      // given
      const { userId } = databaseBuilder.factory.buildCampaignParticipation();
      databaseBuilder.factory.buildTraining();

      await databaseBuilder.commit();

      // when
      const result = await userRecommendedTrainingRepository.hasRecommendedTrainings(userId);

      // then
      expect(result).to.equal(false);
    });
  });
});
