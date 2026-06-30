import { OrganizationProfileReward } from '../../../../../src/profile/domain/models/OrganizationProfileReward.js';
import {
  getByOrganizationId,
  removeInBatch,
  save,
} from '../../../../../src/profile/infrastructure/repositories/organizations-profile-reward-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Profile | Integration | Infrastructure | Repository | organizations-profile-rewards-repository', function () {
  describe('#save', function () {
    it('should save organization profile reward', async function () {
      // given
      const profileReward = databaseBuilder.factory.buildProfileReward();
      const organization = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      // when
      await save({ organizationId: organization.id, profileRewardId: profileReward.id });

      // then
      const organizationProfileReward = await knex('organizations-profile-rewards').where({
        organizationId: organization.id,
        profileRewardId: profileReward.id,
      });
      expect(organizationProfileReward).to.have.lengthOf(1);
    });

    it('should save organization profile reward for other profile reward id but for the same organization', async function () {
      // given
      const profileReward = databaseBuilder.factory.buildProfileReward();
      const otherProfileReward = databaseBuilder.factory.buildProfileReward({ rewardId: 11 });
      const organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId: organization.id,
        profileRewardId: profileReward.id,
      });

      await databaseBuilder.commit();

      // when
      await save({ organizationId: organization.id, profileRewardId: otherProfileReward.id });

      // then
      const organizationProfileReward = await knex('organizations-profile-rewards').select('profileRewardId').where({
        organizationId: organization.id,
      });
      expect(organizationProfileReward).to.have.lengthOf(2);
      expect(organizationProfileReward).to.have.deep.members([
        { profileRewardId: profileReward.id },
        { profileRewardId: otherProfileReward.id },
      ]);
    });

    it('should do nothing if profile reward is already existing for same organization', async function () {
      // given
      const profileReward = databaseBuilder.factory.buildProfileReward();
      const organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId: organization.id,
        profileRewardId: profileReward.id,
      });
      await databaseBuilder.commit();

      // when
      await save({ organizationId: organization.id, profileRewardId: profileReward.id });

      // then
      const organizationProfileReward = await knex('organizations-profile-rewards').where({
        organizationId: organization.id,
        profileRewardId: profileReward.id,
      });
      expect(organizationProfileReward).to.have.lengthOf(1);
    });
  });

  describe('#getByOrganizationId', function () {
    it('should return empty array if profile rewards does not exist for given organizationId', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const attestationKey = databaseBuilder.factory.buildAttestation().key;

      await databaseBuilder.commit();

      // when
      const results = await getByOrganizationId({ attestationKey, organizationId });

      // then
      expect(results).to.be.empty;
    });

    it('should return profile rewards for given organizationId', async function () {
      // given
      const { key: attestationKey, id: rewardId } = databaseBuilder.factory.buildAttestation();
      const firstProfileReward = databaseBuilder.factory.buildProfileReward({ rewardId });
      const secondProfileReward = databaseBuilder.factory.buildProfileReward({ rewardId });
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const firstOrganizationProfileReward = databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId,
        profileRewardId: firstProfileReward.id,
      });
      const secondOrganizationProfileReward = databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId,
        profileRewardId: secondProfileReward.id,
      });
      databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId,
        profileRewardId: null,
      });
      await databaseBuilder.commit();

      // when
      const results = await getByOrganizationId({ attestationKey, organizationId });

      // then
      const expectedResults = [
        {
          id: firstOrganizationProfileReward.id,
          profileRewardId: firstProfileReward.id,
          organizationId,
          userId: firstProfileReward.userId,
        },
        {
          id: secondOrganizationProfileReward.id,
          profileRewardId: secondProfileReward.id,
          organizationId,
          userId: secondProfileReward.userId,
        },
      ];

      expect(results).to.have.lengthOf(2);
      expect(results).to.have.deep.members(expectedResults);
    });

    it('should not return profile rewards for another organizationId', async function () {
      // given
      const { key: attestationKey, id: rewardId } = databaseBuilder.factory.buildAttestation();
      const firstProfileReward = databaseBuilder.factory.buildProfileReward({ rewardId });
      const secondProfileReward = databaseBuilder.factory.buildProfileReward({ rewardId });
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const firstOrganizationProfileReward = databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId,
        profileRewardId: firstProfileReward.id,
      });
      databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId: anotherOrganizationId,
        profileRewardId: secondProfileReward.id,
      });
      await databaseBuilder.commit();

      // when
      const results = await getByOrganizationId({ attestationKey, organizationId });

      // then
      const expectedResults = [
        {
          id: firstOrganizationProfileReward.id,
          profileRewardId: firstProfileReward.id,
          organizationId,
          userId: firstProfileReward.userId,
        },
      ];

      expect(results).to.have.lengthOf(1);
      expect(results).to.have.deep.members(expectedResults);
    });

    it('should not return profile rewards for other organizationId', async function () {
      // given
      const { key: attestationKey, id: rewardId } = databaseBuilder.factory.buildAttestation();
      const profileReward = databaseBuilder.factory.buildProfileReward({ rewardId });
      const otherProfileReward = databaseBuilder.factory.buildProfileReward({ rewardId });
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const expectedProfileReward = new OrganizationProfileReward({
        ...databaseBuilder.factory.buildOrganizationsProfileRewards({
          organizationId,
          profileRewardId: profileReward.id,
        }),
        userId: profileReward.userId,
      });
      databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId: otherOrganizationId,
        profileRewardId: otherProfileReward.id,
      });

      await databaseBuilder.commit();

      // when
      const results = await getByOrganizationId({ attestationKey, organizationId });

      // then
      expect(results).to.have.lengthOf(1);
      expect(results[0]).to.deep.equal(expectedProfileReward);
    });

    context('when attestationKey is not provided', function () {
      it('should return all profile rewards for given organization', async function () {
        // given
        const { id: rewardId } = databaseBuilder.factory.buildAttestation();
        const firstProfileReward = databaseBuilder.factory.buildProfileReward({ rewardId });
        const secondProfileReward = databaseBuilder.factory.buildProfileReward({ rewardId });
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const firstOrganizationProfileReward = databaseBuilder.factory.buildOrganizationsProfileRewards({
          organizationId,
          profileRewardId: firstProfileReward.id,
        });
        const secondOrganizationProfileReward = databaseBuilder.factory.buildOrganizationsProfileRewards({
          organizationId,
          profileRewardId: secondProfileReward.id,
        });
        databaseBuilder.factory.buildOrganizationsProfileRewards({
          organizationId,
          profileRewardId: null,
        });
        await databaseBuilder.commit();

        // when
        const results = await getByOrganizationId({ organizationId });

        // then
        const expectedResults = [
          {
            id: firstOrganizationProfileReward.id,
            profileRewardId: firstProfileReward.id,
            organizationId,
            userId: firstProfileReward.userId,
          },
          {
            id: secondOrganizationProfileReward.id,
            profileRewardId: secondProfileReward.id,
            organizationId,
            userId: secondProfileReward.userId,
          },
        ];

        expect(results).to.have.lengthOf(2);
        expect(results).to.have.deep.members(expectedResults);
      });
    });
  });

  describe('#removeInBatch', function () {
    it('should removeInBatch profile rewards', async function () {
      // given
      const { id: rewardId } = databaseBuilder.factory.buildAttestation();
      const profileReward = databaseBuilder.factory.buildProfileReward({ rewardId });
      const otherProfileReward = databaseBuilder.factory.buildProfileReward({ rewardId });
      const thirdProfileReward = databaseBuilder.factory.buildProfileReward({ rewardId });
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const organizationProfileReward1 = databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId,
        profileRewardId: profileReward.id,
      });
      const organizationProfileReward2 = databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId,
        profileRewardId: otherProfileReward.id,
      });
      databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId,
        profileRewardId: thirdProfileReward.id,
      });

      await databaseBuilder.commit();

      // when
      await removeInBatch([organizationProfileReward1, organizationProfileReward2]);

      // then
      const results = await knex('organizations-profile-rewards').whereNull('profileRewardId');
      expect(results).to.have.lengthOf(2);
      expect(results[0]).to.deep.equal({ id: organizationProfileReward1.id, organizationId, profileRewardId: null });
      expect(results[1]).to.deep.equal({ id: organizationProfileReward2.id, organizationId, profileRewardId: null });
    });
  });
});
