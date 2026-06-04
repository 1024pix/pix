import _ from 'lodash';
import sinon from 'sinon';

import { USER_RECOMMENDED_TRAININGS_TABLE_NAME } from '../../../../../db/migrations/20221017085933_create-user-recommended-trainings.js';
import { UserRecommendedTraining } from '../../../../../src/devcomp/domain/read-models/UserRecommendedTraining.js';
import * as userRecommendedTrainingRepository from '../../../../../src/devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import { deleteCampaignParticipationIds } from '../../../../../src/devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Repository | user-recommended-training-repository', function () {
  describe('#save', function () {
    it('should persist userRecommendedTraining', async function () {
      // given
      const userRecommendedTraining = {
        userId: databaseBuilder.factory.buildUser().id,
        trainingId: databaseBuilder.factory.buildTraining().id,
        campaignParticipationId: databaseBuilder.factory.buildCampaignParticipation().id,
        isRelevant: true,
      };
      await databaseBuilder.commit();

      // when
      await userRecommendedTrainingRepository.save(userRecommendedTraining);

      // then
      const persistedUserRecommendedTraining = await knex(USER_RECOMMENDED_TRAININGS_TABLE_NAME)
        .where({
          userId: userRecommendedTraining.userId,
          trainingId: userRecommendedTraining.trainingId,
          campaignParticipationId: userRecommendedTraining.campaignParticipationId,
        })
        .first();
      expect(_.omit(persistedUserRecommendedTraining, ['id', 'createdAt', 'updatedAt'])).to.deep.equal(
        userRecommendedTraining,
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
      expect(async () => {
        await saveSameUserRecommendedTraining();

        const updatedUserRecommendedTraining = await knex(USER_RECOMMENDED_TRAININGS_TABLE_NAME)
          .where({
            id: userRecommendedTraining.id,
          })
          .first();
        expect(updatedUserRecommendedTraining.updatedAt).to.be.above(userRecommendedTraining.updatedAt);
      }).not.to.throw();
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
        isRelevant: true,
      };
      const userRecommendedTraining2 = {
        userId,
        trainingId: databaseBuilder.factory.buildTraining().id,
        campaignParticipationId,
        isRelevant: false,
      };
      const userRecommendedTrainingWithAnotherLocale = {
        userId,
        trainingId: databaseBuilder.factory.buildTraining({ locales: ['en'] }).id,
        campaignParticipationId,
        isRelevant: false,
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
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.be.instanceOf(UserRecommendedTraining);
      expect(result[0]).to.deep.equal(
        new UserRecommendedTraining({ ...training, duration: { hours: 6 }, isRelevant: true }),
      );
    });

    it('should not return disabled recommended trainings for given campaignParticipationId and locale', async function () {
      // given
      const { id: campaignParticipationId, userId } = databaseBuilder.factory.buildCampaignParticipation();
      const training = databaseBuilder.factory.buildTraining();
      const userRecommendedTrainingDisabled = {
        userId,
        trainingId: databaseBuilder.factory.buildTraining({ isDisabled: true }).id,
        campaignParticipationId,
      };
      const userRecommendedTrainingEnabled = {
        userId,
        trainingId: training.id,
        campaignParticipationId,
      };
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTrainingDisabled);
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTrainingEnabled);
      await databaseBuilder.commit();

      // when
      const result = await userRecommendedTrainingRepository.findByCampaignParticipationId({
        campaignParticipationId,
        locale: 'fr-fr',
      });

      // then
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.be.instanceOf(UserRecommendedTraining);
      expect(result[0]).to.deep.equal(
        new UserRecommendedTraining({ ...training, duration: { hours: 6 }, isRelevant: null }),
      );
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
      expect(result).to.have.lengthOf(0);
    });
  });
  describe('#findByCampaignParticipationIdAndTrainingIdAndUserId', function () {
    it('should return recommended training for given campaignParticipationId, trainingId and userId', async function () {
      // given
      const { id: campaignParticipationId, userId } = databaseBuilder.factory.buildCampaignParticipation();
      const training = databaseBuilder.factory.buildTraining();
      const userRecommendedTraining1 = {
        userId,
        trainingId: training.id,
        campaignParticipationId,
        isRelevant: true,
      };
      const userRecommendedTraining2 = {
        userId,
        trainingId: databaseBuilder.factory.buildTraining().id,
        campaignParticipationId,
        isRelevant: false,
      };

      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTraining1);
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTraining2);

      await databaseBuilder.commit();

      // when
      const result = await userRecommendedTrainingRepository.findByCampaignParticipationIdAndTrainingIdAndUserId({
        campaignParticipationId,
        trainingId: training.id,
        userId,
      });

      // then
      expect(result).to.be.instanceOf(UserRecommendedTraining);
      expect(result).to.deep.equal(
        new UserRecommendedTraining({ ...training, duration: { hours: 6 }, isRelevant: true }),
      );
    });

    it('should not return recommended training for disabled training', async function () {
      // given
      const { id: campaignParticipationId, userId } = databaseBuilder.factory.buildCampaignParticipation();
      const training = databaseBuilder.factory.buildTraining({ isDisabled: true });
      const userRecommendedTraining1 = {
        userId,
        trainingId: training.id,
        campaignParticipationId,
        isRelevant: true,
      };

      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTraining1);

      await databaseBuilder.commit();

      // when
      const result = await userRecommendedTrainingRepository.findByCampaignParticipationIdAndTrainingIdAndUserId({
        campaignParticipationId,
        trainingId: training.id,
        userId,
      });

      // then
      expect(result).to.be.null;
    });

    describe('when recommended training does not exist for given campaignParticipationId, trainingId and userId', function () {
      it('should return null', async function () {
        // given
        const { id: campaignParticipationId, userId } = databaseBuilder.factory.buildCampaignParticipation();
        const training = databaseBuilder.factory.buildTraining();
        const userRecommendedTraining1 = {
          userId,
          trainingId: training.id,
          campaignParticipationId,
          isRelevant: true,
        };
        databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTraining1);

        const otherUserId = databaseBuilder.factory.buildUser().id;

        await databaseBuilder.commit();

        // when
        const result = await userRecommendedTrainingRepository.findByCampaignParticipationIdAndTrainingIdAndUserId({
          campaignParticipationId,
          trainingId: training.id,
          userId: otherUserId,
        });

        // then
        expect(result).to.be.null;
      });
    });
  });

  describe('#findModulesByCampaignParticipationIds', function () {
    it('should return saved recommended modules for given campaignParticipationId', async function () {
      // given
      const { id: campaignParticipationId, userId } = databaseBuilder.factory.buildCampaignParticipation();
      const training = databaseBuilder.factory.buildTraining({ type: 'modulix' });
      const userRecommendedTraining1 = {
        userId,
        trainingId: training.id,
        campaignParticipationId,
      };
      const userRecommendedTraining2 = {
        userId,
        trainingId: databaseBuilder.factory.buildTraining({ type: 'webinaire' }).id,
        campaignParticipationId,
      };
      const anotherCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation();
      const anotherTraining = databaseBuilder.factory.buildTraining({ type: 'modulix' });
      const anotherUserRecommendedTraining = {
        userId: anotherCampaignParticipation.userId,
        trainingId: anotherTraining.id,

        campaignParticipationId: anotherCampaignParticipation.id,
      };
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTraining1);
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTraining2);
      databaseBuilder.factory.buildUserRecommendedTraining(anotherUserRecommendedTraining);
      await databaseBuilder.commit();

      // when
      const result = await userRecommendedTrainingRepository.findModulesByCampaignParticipationIds({
        campaignParticipationIds: [campaignParticipationId, anotherCampaignParticipation.id],
      });

      // then
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.be.instanceOf(UserRecommendedTraining);
      expect(result[0]).to.deep.equal(new UserRecommendedTraining({ ...training, duration: { hours: 6 } }));
      expect(result[1]).to.be.instanceOf(UserRecommendedTraining);
      expect(result[1]).to.deep.equal(new UserRecommendedTraining({ ...anotherTraining, duration: { hours: 6 } }));
    });

    it('should  not return twice the same module', async function () {
      // given
      const { id: campaignParticipationId, userId } = databaseBuilder.factory.buildCampaignParticipation();
      const training = databaseBuilder.factory.buildTraining({ type: 'modulix' });
      const userRecommendedTraining1 = {
        userId,
        trainingId: training.id,
        campaignParticipationId,
      };
      const anotherCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ userId });
      const anotherUserRecommendedTraining = {
        userId,
        trainingId: training.id,

        campaignParticipationId: anotherCampaignParticipation.id,
      };
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTraining1);
      databaseBuilder.factory.buildUserRecommendedTraining(anotherUserRecommendedTraining);
      await databaseBuilder.commit();

      // when
      const result = await userRecommendedTrainingRepository.findModulesByCampaignParticipationIds({
        campaignParticipationIds: [campaignParticipationId, anotherCampaignParticipation.id],
      });

      // then
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.be.instanceOf(UserRecommendedTraining);
      expect(result[0]).to.deep.equal(new UserRecommendedTraining({ ...training, duration: { hours: 6 } }));
    });

    it('should not return disabled recommended trainings for given campaignParticipationId and locale', async function () {
      // given
      const { id: campaignParticipationId, userId } = databaseBuilder.factory.buildCampaignParticipation();
      const training = databaseBuilder.factory.buildTraining({ type: 'modulix' });
      const userRecommendedTrainingDisabled = {
        userId,
        trainingId: databaseBuilder.factory.buildTraining({ type: 'modulix', isDisabled: true }).id,
        campaignParticipationId,
      };
      const userRecommendedTrainingEnabled = {
        userId,
        trainingId: training.id,
        campaignParticipationId,
      };
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTrainingDisabled);
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTrainingEnabled);
      await databaseBuilder.commit();

      // when
      const result = await userRecommendedTrainingRepository.findModulesByCampaignParticipationIds({
        campaignParticipationIds: [campaignParticipationId],
      });

      // then
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.be.instanceOf(UserRecommendedTraining);
      expect(result[0]).to.deep.equal(new UserRecommendedTraining({ ...training, duration: { hours: 6 } }));
    });

    it('should return an empty array when user has no recommended training for this campaignParticipation', async function () {
      // given
      const { id: campaignParticipationId, userId } = databaseBuilder.factory.buildCampaignParticipation();
      const anotherCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation();
      const userRecommendedTraining = {
        userId,
        trainingId: databaseBuilder.factory.buildTraining({ type: 'modulix' }).id,
        campaignParticipationId,
      };
      databaseBuilder.factory.buildUserRecommendedTraining(userRecommendedTraining);
      await databaseBuilder.commit();

      // when
      const result = await userRecommendedTrainingRepository.findModulesByCampaignParticipationIds({
        campaignParticipationIds: [anotherCampaignParticipation.id],
      });

      // then
      expect(result).to.have.lengthOf(0);
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
      const result = await userRecommendedTrainingRepository.hasRecommendedTrainings({ userId });

      // then
      expect(result).to.equal(true);
    });

    it('should return false if the user has no recommended trainings', async function () {
      // given
      const { userId } = databaseBuilder.factory.buildCampaignParticipation();
      databaseBuilder.factory.buildTraining();

      await databaseBuilder.commit();

      // when
      const result = await userRecommendedTrainingRepository.hasRecommendedTrainings({ userId });

      // then
      expect(result).to.equal(false);
    });
  });

  describe(deleteCampaignParticipationIds.name, function () {
    let now, clock;
    beforeEach(function () {
      now = new Date('2025-01-01');
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });
    afterEach(function () {
      clock.restore();
    });

    it('should set campaignParticipationId to null for given campaignParticipationIds', async function () {
      // given
      const campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation();
      const campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation();
      const campaignParticipation3 = databaseBuilder.factory.buildCampaignParticipation();

      databaseBuilder.factory.buildUserRecommendedTraining({
        campaignParticipationId: campaignParticipation1.id,
        userId: campaignParticipation1.userId,
        updatedAt: new Date('2021-01-01'),
      });
      databaseBuilder.factory.buildUserRecommendedTraining({
        campaignParticipationId: campaignParticipation2.id,
        userId: campaignParticipation2.userId,
        updatedAt: new Date('2021-01-01'),
      });
      const userRecommendedTraining3 = databaseBuilder.factory.buildUserRecommendedTraining({
        campaignParticipationId: campaignParticipation3.id,
        userId: campaignParticipation3.userId,
        updatedAt: new Date('2021-01-01'),
      });
      await databaseBuilder.commit();

      // when
      await userRecommendedTrainingRepository.deleteCampaignParticipationIds({
        campaignParticipationIds: [campaignParticipation1.id, campaignParticipation2.id],
      });

      // then
      const updatedUserRecommendedTrainings = await knex(USER_RECOMMENDED_TRAININGS_TABLE_NAME)
        .select('userId', 'campaignParticipationId')
        .where('updatedAt', now);

      expect(updatedUserRecommendedTrainings).to.have.lengthOf(2);
      expect(updatedUserRecommendedTrainings).deep.members([
        {
          userId: campaignParticipation1.userId,
          campaignParticipationId: null,
        },
        {
          userId: campaignParticipation2.userId,
          campaignParticipationId: null,
        },
      ]);

      const otherRecommendedTrainings = await knex(USER_RECOMMENDED_TRAININGS_TABLE_NAME)
        .select('userId', 'campaignParticipationId', 'updatedAt')
        .where('updatedAt', '!=', now);

      expect(otherRecommendedTrainings).lengthOf(1);

      expect(otherRecommendedTrainings).deep.members([
        {
          userId: campaignParticipation3.userId,
          campaignParticipationId: campaignParticipation3.id,
          updatedAt: userRecommendedTraining3.updatedAt,
        },
      ]);
    });
  });
});
