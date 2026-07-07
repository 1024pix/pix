import { ATTESTATIONS } from '../../../../../src/profile/domain/constants.js';
import { ProfileReward } from '../../../../../src/profile/domain/models/ProfileReward.js';
import {
  findByUserIdAndRewardId,
  findByUserIdsAndRewardId,
  getByAttestationKeyAndUserIds,
  getById,
  getByIds,
  getByUserId,
  save,
} from '../../../../../src/profile/infrastructure/repositories/profile-reward-repository.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Profile | Integration | Repository | profile-reward', function () {
  describe('#save', function () {
    it('should give a reward to the user', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { rewardId } = databaseBuilder.factory.buildQuest({
        rewardType: REWARD_TYPES.ATTESTATION,
        eligibilityRequirements: [],
        successRequirements: [],
      });
      await databaseBuilder.commit();

      // when
      await save({ userId: userId, rewardId });

      // then
      const result = await knex('profile-rewards').where({ userId: userId });

      expect(result).to.have.lengthOf(1);
      expect(result[0].userId).to.equal(userId);
      expect(result[0].rewardId).to.equal(rewardId);
      expect(result[0].rewardType).to.equal(REWARD_TYPES.ATTESTATION);
    });

    it('should not throw unicity error if user already have reward', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { rewardId } = databaseBuilder.factory.buildQuest({
        rewardType: REWARD_TYPES.ATTESTATION,
        eligibilityRequirements: [],
        successRequirements: [],
      });
      databaseBuilder.factory.buildProfileReward({ rewardId, userId });
      await databaseBuilder.commit();

      // when
      await save({ userId: userId, rewardId });

      // then
      const result = await knex('profile-rewards').where({ userId: userId });

      expect(result).to.have.lengthOf(1);
      expect(result[0].userId).to.equal(userId);
      expect(result[0].rewardId).to.equal(rewardId);
      expect(result[0].rewardType).to.equal(REWARD_TYPES.ATTESTATION);
    });
  });

  describe('#getById', function () {
    it('should return null if the profile reward does not exist', async function () {
      // given
      const notExistingProfileRewardId = 12;

      // when
      const result = await getById({ profileRewardId: notExistingProfileRewardId });

      // then
      expect(result).to.be.null;
    });

    it('should return the expected profile reward', async function () {
      // given
      const attestation = databaseBuilder.factory.buildAttestation({ key: 'key' });
      const expectedProfileReward = databaseBuilder.factory.buildProfileReward({ rewardId: attestation.id });

      const otherAttestation = databaseBuilder.factory.buildAttestation({ key: 'otherkey' });
      databaseBuilder.factory.buildProfileReward({ rewardId: otherAttestation.id });

      await databaseBuilder.commit();

      // when
      const result = await getById({ profileRewardId: expectedProfileReward.id });

      // then
      expect(result).to.be.an.instanceof(ProfileReward);
      expect(result.id).to.equal(expectedProfileReward.id);
    });
  });

  describe('#getByIds', function () {
    it('should return empty array if the profile rewards does not exist', async function () {
      // given
      const notExistingProfileRewardId = 12;

      // when
      const result = await getByIds({ profileRewardIds: [notExistingProfileRewardId] });

      // then
      expect(result).to.be.empty;
    });

    it('should return the profile rewards for given ids', async function () {
      // given
      const attestation = databaseBuilder.factory.buildAttestation({ key: 'key' });
      const firstProfileReward = databaseBuilder.factory.buildProfileReward({ rewardId: attestation.id });
      const secondProfileReward = databaseBuilder.factory.buildProfileReward({ rewardId: attestation.id });
      const expectedProfileReward = [firstProfileReward.id, secondProfileReward.id];

      databaseBuilder.factory.buildProfileReward();

      await databaseBuilder.commit();

      // when
      const results = await getByIds({ profileRewardIds: expectedProfileReward });

      // then
      expect(results).to.have.lengthOf(2);
      expect(results[0]).to.deep.include({
        id: firstProfileReward.id,
        createdAt: firstProfileReward.createdAt,
        rewardType: firstProfileReward.rewardType,
        rewardId: firstProfileReward.rewardId,
        userId: firstProfileReward.userId,
      });
      expect(results[1]).to.deep.include({
        id: secondProfileReward.id,
        createdAt: secondProfileReward.createdAt,
        rewardType: secondProfileReward.rewardType,
        rewardId: secondProfileReward.rewardId,
        userId: secondProfileReward.userId,
      });
    });
  });

  describe('#getByUserId', function () {
    it('should return all profile rewards for the user', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: secondUserId } = databaseBuilder.factory.buildUser();

      const firstAttestation = databaseBuilder.factory.buildAttestation({
        templateName: 'firstTemplateName',
        key: 'firstKey',
      });
      const { rewardId: firstRewardId } = databaseBuilder.factory.buildQuest({
        rewardId: firstAttestation.id,
        rewardType: REWARD_TYPES.ATTESTATION,
        eligibilityRequirements: [],
        successRequirements: [],
      });
      const otherAttestation = databaseBuilder.factory.buildAttestation({
        templateName: 'otherTemplateName',
        key: 'otherKey',
      });

      const { rewardId: secondRewardId } = databaseBuilder.factory.buildQuest({
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: otherAttestation.id,
        eligibilityRequirements: [],
        successRequirements: [],
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
      expect(result).to.have.lengthOf(2);
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
      expect(result).to.have.lengthOf(0);
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
      expect(result).to.have.lengthOf(0);
    });
  });

  describe('#findByUserIdAndRewardId', function () {
    it('should return null if the reward does not exist', async function () {
      // given
      const notExistingRewardId = 12;
      const userId = 34;

      // when
      const result = await findByUserIdAndRewardId({ rewardId: notExistingRewardId, userId });

      // then
      expect(result).to.be.null;
    });

    it('should return null if the profile reward does not exist', async function () {
      // given
      const rewardId = databaseBuilder.factory.buildAttestation().id;
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      //when
      const result = await findByUserIdAndRewardId({ rewardId, userId });

      // then
      expect(result).to.be.null;
    });

    it('should return the expected profile reward', async function () {
      // given
      const attestation = databaseBuilder.factory.buildAttestation({ key: 'key' });
      databaseBuilder.factory.buildProfileReward({ rewardId: attestation.id });
      const user = databaseBuilder.factory.buildUser();

      const expectedProfileReward = databaseBuilder.factory.buildProfileReward({
        rewardId: attestation.id,
        userId: user.id,
      });

      await databaseBuilder.commit();

      // when
      const result = await findByUserIdAndRewardId({ rewardId: expectedProfileReward.rewardId, userId: user.id });

      // then
      expect(result).to.be.an.instanceof(ProfileReward);
      expect(result.id).to.equal(expectedProfileReward.id);
      expect(result.rewardType).to.equal(REWARD_TYPES.ATTESTATION);
    });
  });
  describe('#findByUserIdsAndRewardIds', function () {
    it('should return the expected profile reward', async function () {
      // given
      const attestation = databaseBuilder.factory.buildAttestation({ key: 'key' });
      const attestation2 = databaseBuilder.factory.buildAttestation({ key: 'key2' });
      databaseBuilder.factory.buildProfileReward({ rewardId: attestation.id });
      databaseBuilder.factory.buildProfileReward();

      const user1 = databaseBuilder.factory.buildUser();
      const user2 = databaseBuilder.factory.buildUser();

      const attestation1User1 = databaseBuilder.factory.buildProfileReward({
        rewardId: attestation.id,
        userId: user1.id,
      });

      const attestation1User2 = databaseBuilder.factory.buildProfileReward({
        rewardId: attestation.id,
        userId: user2.id,
      });

      databaseBuilder.factory.buildProfileReward({
        rewardId: attestation2.id,
        userId: user2.id,
      });

      await databaseBuilder.commit();

      // when
      const results = await findByUserIdsAndRewardId({
        rewardId: attestation.id,
        userIds: [user1.id, user2.id],
      });

      // then
      expect(results.length).to.equal(2);
      expect(results[0]).to.be.an.instanceof(ProfileReward);
      expect(results[0].id).to.equal(attestation1User1.id);
      expect(results[0].rewardType).to.equal(REWARD_TYPES.ATTESTATION);

      expect(results[1]).to.be.an.instanceof(ProfileReward);
      expect(results[1].id).to.equal(attestation1User2.id);
      expect(results[1].rewardType).to.equal(REWARD_TYPES.ATTESTATION);
    });
    it('should return an empty array if the reward does not exist', async function () {
      // given
      const notExistingRewardId = 12;
      const user = databaseBuilder.factory.buildUser();

      // when
      const result = await findByUserIdsAndRewardId({ rewardId: notExistingRewardId, userIds: [user.id] });

      // then
      expect(result.length).to.equal(0);
    });
    it('should return an empty array if no one in the given users has a profile reward', async function () {
      // given
      const rewardId = databaseBuilder.factory.buildAttestation().id;
      const user1Id = databaseBuilder.factory.buildUser().id;
      const user2Id = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();

      //when
      const result = await findByUserIdsAndRewardId({ rewardId, userIds: [user1Id, user2Id] });

      // then
      expect(result.length).to.equal(0);
    });
  });
});
