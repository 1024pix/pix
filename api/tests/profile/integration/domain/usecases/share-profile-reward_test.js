import { ProfileRewardCantBeSharedError } from '../../../../../src/profile/domain/errors.js';
import { usecases } from '../../../../../src/profile/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Profile | Integration | Domain | Usecases | share-profile-reward', function () {
  describe('#shareProfileReward', function () {
    describe('if the reward does not exist', function () {
      let user;

      before(async function () {
        user = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();
      });

      it('should throw an ProfileRewardCantBeSharedError', async function () {
        const error = await catchErr(usecases.shareProfileReward)({
          userId: user.id,
          profileRewardId: 1,
          campaignParticipationId: 1,
        });
        expect(error).to.be.instanceOf(ProfileRewardCantBeSharedError);
      });
    });

    describe('if the reward does not belong to the user', function () {
      let profileReward;
      let user;

      before(async function () {
        const otherUserId = databaseBuilder.factory.buildUser().id;
        user = databaseBuilder.factory.buildUser();
        profileReward = databaseBuilder.factory.buildProfileReward({
          rewardId: 1,
          userId: otherUserId,
        });

        await databaseBuilder.commit();
      });

      it('should throw an ProfileRewardCantBeSharedError', async function () {
        expect(
          await catchErr(usecases.shareProfileReward)({
            userId: user.id,
            profileRewardId: profileReward.id,
            campaignParticipationId: 1,
          }),
        ).to.be.instanceOf(ProfileRewardCantBeSharedError);
      });
    });

    describe('if the reward belongs to the user', function () {
      let profileRewardId;
      let campaignParticipationId;
      let userId;

      before(async function () {
        userId = databaseBuilder.factory.buildUser().id;
        profileRewardId = databaseBuilder.factory.buildProfileReward({
          rewardId: 1,
          userId: userId,
        }).id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          userId,
        }).id;

        await databaseBuilder.commit();
      });

      it('should insert a new line in organization-profile-rewards table', async function () {
        await usecases.shareProfileReward({
          userId,
          profileRewardId,
          campaignParticipationId,
        });

        const organizationsProfileRewards = await knex('organizations-profile-rewards');

        expect(organizationsProfileRewards).to.have.lengthOf(1);
        expect(organizationsProfileRewards[0].profileRewardId).to.equal(profileRewardId);
      });
    });
  });
});
