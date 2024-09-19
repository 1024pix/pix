import { PROFILE_REWARDS_TABLE_NAME } from '../../../../../db/migrations/20240820101213_add-profile-rewards-table.js';
import { save } from '../../../../../src/profile/infrastructure/repositories/profile-reward-repository.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Profile | Integration | Repository | profile-reward', function () {
  describe('#save', function () {
    it('should give a reward to the user', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { rewardId } = databaseBuilder.factory.buildQuest({
        id: userId,
        rewardType: REWARD_TYPES.ATTESTATION,
        eligibilityRequirements: { toto: 'tata' },
        successRequirements: { titi: 'tutu' },
      });
      await databaseBuilder.commit();

      // when
      await save({ userId: userId, rewardId });

      // then
      const result = await knex(PROFILE_REWARDS_TABLE_NAME).where({ userId: userId });

      expect(result.length).to.equal(1);
      expect(result[0].userId).to.equal(userId);
      expect(result[0].rewardId).to.equal(rewardId);
      expect(result[0].rewardType).to.equal(REWARD_TYPES.ATTESTATION);
    });
  });
});
