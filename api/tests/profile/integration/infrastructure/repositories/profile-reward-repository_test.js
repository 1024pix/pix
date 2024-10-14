import { PROFILE_REWARDS_TABLE_NAME } from '../../../../../db/migrations/20240820101213_add-profile-rewards-table.js';
import { ATTESTATIONS } from '../../../../../src/profile/domain/constants.js';
import { ProfileReward } from '../../../../../src/profile/domain/models/ProfileReward.js';
import {
  getByAttestationKeyAndUserIds,
  getByUserId,
  save,
} from '../../../../../src/profile/infrastructure/repositories/profile-reward-repository.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Profile | Integration | Repository | profile-reward', function () {
  describe('#save', function () {
    it('should give a reward to the user', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { rewardId } = databaseBuilder.factory.buildQuest({
        rewardType: REWARD_TYPES.ATTESTATION,
        eligibilityRequirements: {},
        successRequirements: {},
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

  describe('#getByUserId', function () {
    it('should return all profile rewards for the user', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: secondUserId } = databaseBuilder.factory.buildUser();

      const { rewardId: firstRewardId } = databaseBuilder.factory.buildQuest({
        rewardType: REWARD_TYPES.ATTESTATION,
        eligibilityRequirements: {},
        successRequirements: {},
      });
      const otherAttestation = databaseBuilder.factory.buildAttestation({
        templateName: 'otherTemplateName',
        key: 'otherKey',
      });
      const { rewardId: secondRewardId } = databaseBuilder.factory.buildQuest({
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: otherAttestation.id,
        eligibilityRequirements: {},
        successRequirements: {},
      });
      databaseBuilder.factory.buildProfileReward({
        rewardId: firstRewardId,
        userId,
      });
      databaseBuilder.factory.buildProfileReward({
        rewardId: secondRewardId,
        userId,
      });
      databaseBuilder.factory.buildProfileReward({
        rewardId: secondRewardId,
        userId: secondUserId,
      });
      await databaseBuilder.commit();

      // when
      const result = await getByUserId({ userId });

      // then
      expect(result.length).to.equal(2);
      expect(result[0].rewardId).to.equal(firstRewardId);
      expect(result[0]).to.be.an.instanceof(ProfileReward);
      expect(result[1].rewardId).to.equal(secondRewardId);
      expect(result[1]).to.be.an.instanceof(ProfileReward);
    });

    it('should return empty array if there are no rewards', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();

      await databaseBuilder.commit();

      // when
      const result = await getByUserId({ userId });

      // then
      expect(result).to.be.empty;
    });
  });

  describe('#getByAttestationKeyAndUserIds', function () {
    it('should return an empty array if there are no attestations for these users', async function () {
      // given
      const attestation = databaseBuilder.factory.buildAttestation();
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const result = await getByAttestationKeyAndUserIds({ attestationKey: attestation.key, userIds: [user.id] });

      // then
      expect(result.length).to.equal(0);
    });

    it('should return all attestations for users', async function () {
      // given
      const attestation = databaseBuilder.factory.buildAttestation();
      const firstUser = databaseBuilder.factory.buildUser();
      const secondUser = databaseBuilder.factory.buildUser();
      const expectedProfileRewards = [];
      expectedProfileRewards.push(
        new ProfileReward(
          databaseBuilder.factory.buildProfileReward({ rewardId: attestation.id, userId: firstUser.id }),
        ),
      );
      expectedProfileRewards.push(
        new ProfileReward(
          databaseBuilder.factory.buildProfileReward({ rewardId: attestation.id, userId: secondUser.id }),
        ),
      );
      await databaseBuilder.commit();

      // when
      const result = await getByAttestationKeyAndUserIds({
        attestationKey: attestation.key,
        userIds: [firstUser.id, secondUser.id],
      });

      // then
      expect(result).to.be.deep.equal(expectedProfileRewards);
      expect(result[0]).to.be.an.instanceof(ProfileReward);
      expect(result[1]).to.be.an.instanceof(ProfileReward);
    });

    it('should return attestation ordered by id asc to prevent flakyness', async function () {
      // given
      const attestation = databaseBuilder.factory.buildAttestation();

      const firstReward = new ProfileReward(
        databaseBuilder.factory.buildProfileReward({ id: 2, rewardId: attestation.id }),
      );

      const secondReward = new ProfileReward(
        databaseBuilder.factory.buildProfileReward({ id: 1, rewardId: attestation.id }),
      );

      await databaseBuilder.commit();

      // when
      const result = await getByAttestationKeyAndUserIds({
        attestationKey: attestation.key,
        userIds: [firstReward.userId, secondReward.userId],
      });

      // then
      expect(result[0].id).to.equal(secondReward.id);
      expect(result[1].id).to.equal(firstReward.id);
    });

    it('should not return attestations of other users', async function () {
      // given
      const attestation = databaseBuilder.factory.buildAttestation();
      const firstUser = databaseBuilder.factory.buildUser();
      const secondUser = databaseBuilder.factory.buildUser();
      const expectedFirstUserProfileReward = [];
      expectedFirstUserProfileReward.push(
        new ProfileReward(
          databaseBuilder.factory.buildProfileReward({ rewardId: attestation.id, userId: firstUser.id }),
        ),
      );
      databaseBuilder.factory.buildProfileReward({ rewardId: attestation.id, userId: secondUser.id });
      await databaseBuilder.commit();

      // when
      const result = await getByAttestationKeyAndUserIds({
        attestationKey: attestation.key,
        userIds: [firstUser.id],
      });

      // then
      expect(result).to.be.deep.equal(expectedFirstUserProfileReward);
    });

    it('should not return other attestations', async function () {
      // given
      const attestation = databaseBuilder.factory.buildAttestation({ key: ATTESTATIONS.SIXTH_GRADE });
      const firstUser = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildProfileReward({ rewardId: attestation.id, userId: firstUser.id });
      await databaseBuilder.commit();

      // when
      const result = await getByAttestationKeyAndUserIds({
        attestationKey: 'SOME_KEY',
        userIds: [firstUser.id],
      });

      // then
      expect(result.length).to.equal(0);
    });
  });
});
