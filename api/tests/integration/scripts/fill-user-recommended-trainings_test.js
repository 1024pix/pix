const { expect, databaseBuilder, sinon, knex } = require('../../test-helper');
const {
  sanitizeCampaignParticipations,
  getUserRecommendedTrainings,
  insertUserRecommendedTrainings,
} = require('../../../scripts/fill-user-recommended-trainings');
const trainingRepository = require('../../../lib/infrastructure/repositories/training-repository');

describe('Integration | Scripts | fill-user-recommended-trainings', function () {
  describe('#sanitizeCampaignParticipations', function () {
    it('should return value as number', function () {
      // when
      const result = sanitizeCampaignParticipations([
        { userId: '123', campaignParticipationId: '456', targetProfileId: '789' },
      ]);

      // then
      expect(result).to.deep.equal([{ userId: 123, campaignParticipationId: 456, targetProfileId: 789 }]);
    });
  });

  describe('#getUserRecommendedTraining', function () {
    it('should return user recommended training for given campaign participation', async function () {
      // given
      const targetProfileId = 5432;
      const anotherTargetProfileId = 9876;
      sinon.stub(trainingRepository, 'findByTargetProfileIdAndLocale').resolves([{ id: 1 }, { id: 2 }]);
      const campaignParticipationsToCompute = [
        {
          userId: 123,
          campaignParticipationId: 456,
          targetProfileId,
        },
        {
          userId: 789,
          campaignParticipationId: 1011,
          targetProfileId,
        },
        {
          userId: 123,
          campaignParticipationId: 6789,
          targetProfileId: anotherTargetProfileId,
        },
      ];

      // when
      const userRecommendedTrainings = await getUserRecommendedTrainings({
        campaignParticipations: campaignParticipationsToCompute,
        trainingRepository,
      });

      // then
      expect(trainingRepository.findByTargetProfileIdAndLocale).to.have.been.calledTwice;
      expect(trainingRepository.findByTargetProfileIdAndLocale.firstCall).to.have.been.calledWithExactly({
        targetProfileId,
      });
      expect(trainingRepository.findByTargetProfileIdAndLocale.secondCall).to.have.been.calledWithExactly({
        targetProfileId: anotherTargetProfileId,
      });
      expect(userRecommendedTrainings).to.deep.equal([
        { userId: 123, campaignParticipationId: 456, trainingId: 1 },
        { userId: 123, campaignParticipationId: 456, trainingId: 2 },
        { userId: 789, campaignParticipationId: 1011, trainingId: 1 },
        { userId: 789, campaignParticipationId: 1011, trainingId: 2 },
        { userId: 123, campaignParticipationId: 6789, trainingId: 1 },
        { userId: 123, campaignParticipationId: 6789, trainingId: 2 },
      ]);
    });
  });

  describe('#insertUserRecommendedTrainings', function () {
    afterEach(async function () {
      await knex('user-recommended-trainings').delete();
    });

    it('should insert all user-recommended-trainings', async function () {
      // given
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation();
      const campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation();

      const training1 = databaseBuilder.factory.buildTraining();
      const training2 = databaseBuilder.factory.buildTraining();

      await databaseBuilder.commit();

      const userRecommendedTrainings = [
        {
          userId: campaignParticipation.userId,
          campaignParticipationId: campaignParticipation.id,
          trainingId: training1.id,
        },
        {
          userId: campaignParticipation.userId,
          campaignParticipationId: campaignParticipation.id,
          trainingId: training2.id,
        },
        {
          userId: campaignParticipation2.userId,
          campaignParticipationId: campaignParticipation2.id,
          trainingId: training1.id,
        },
        {
          userId: campaignParticipation2.userId,
          campaignParticipationId: campaignParticipation2.id,
          trainingId: training2.id,
        },
      ];

      // when
      await insertUserRecommendedTrainings(userRecommendedTrainings);

      // then
      const [{ count: userRecommendedTrainingsCount }] = await knex('user-recommended-trainings').count();
      expect(userRecommendedTrainingsCount).to.equal(userRecommendedTrainings.length);
    });

    it('should not throw an error when user-recommended-trainings already exist', async function () {
      // given
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation();
      const training = databaseBuilder.factory.buildTraining();
      const userRecommendedTraining = {
        userId: campaignParticipation.userId,
        campaignParticipationId: campaignParticipation.id,
        trainingId: training.id,
      };
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTraining);
      await databaseBuilder.commit();

      const userRecommendedTrainings = [userRecommendedTraining];

      // when & then
      expect(async () => {
        await insertUserRecommendedTrainings(userRecommendedTrainings);
      }).not.to.throw();
      const [{ count: userRecommendedTrainingsCount }] = await knex('user-recommended-trainings').count();
      expect(userRecommendedTrainingsCount).to.equal(1);
    });
  });
});
