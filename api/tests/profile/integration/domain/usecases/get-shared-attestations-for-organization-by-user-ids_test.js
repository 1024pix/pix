import { AttestationNotFoundError, NoProfileRewardsFoundError } from '../../../../../src/profile/domain/errors.js';
import { User } from '../../../../../src/profile/domain/models/User.js';
import { usecases } from '../../../../../src/profile/domain/usecases/index.js';
import { normalizeAndRemoveAccents } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { catchErr, databaseBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Profile | Integration | Domain | get-shared-attestations-for-organization-by-user-ids', function () {
  let clock;
  const now = new Date('2022-12-25');

  beforeEach(function () {
    clock = sinon.useFakeTimers({
      now,
      toFake: ['Date'],
    });
  });

  afterEach(async function () {
    clock.restore();
  });

  describe('#getAttestationDataForUsers', function () {
    it('should return profile rewards for given userIds', async function () {
      const locale = 'FR-fr';
      const attestation = databaseBuilder.factory.buildAttestation();
      const firstUser = new User(databaseBuilder.factory.buildUser({ firstName: 'alex', lastName: 'Terieur' }));
      const secondUser = new User(databaseBuilder.factory.buildUser({ firstName: 'theo', lastName: 'Courant' }));
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId: firstUser.id });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId: secondUser.id });

      const firstProfileReward = databaseBuilder.factory.buildProfileReward({
        rewardId: attestation.id,
        userId: firstUser.id,
      });
      databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId,
        profileRewardId: firstProfileReward.id,
      });
      const secondProfileReward = databaseBuilder.factory.buildProfileReward({
        rewardId: attestation.id,
        userId: secondUser.id,
      });
      databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId,
        profileRewardId: secondProfileReward.id,
      });

      await databaseBuilder.commit();

      const results = await usecases.getSharedAttestationsForOrganizationByUserIds({
        attestationKey: attestation.key,
        organizationId,
        userIds: [firstUser.id],
        locale,
      });

      expect(results).to.deep.equal({
        data: [firstUser.toForm(firstProfileReward.createdAt, locale, normalizeAndRemoveAccents)],
        templateName: attestation.templateName,
      });
      expect(results.data[0].get('firstName')).to.equal('Alex');
      expect(results.data[0].get('lastName')).to.equal('TERIEUR');
    });

    it('should not return profile rewards for anonymous userIds', async function () {
      const locale = 'FR-fr';
      const attestation = databaseBuilder.factory.buildAttestation();
      const firstUser = databaseBuilder.factory.buildUser({
        firstName: 'alex',
        lastName: 'Terieur',
        isAnonymous: true,
        hasBeenAnonymised: false,
      });
      const secondUser = databaseBuilder.factory.buildUser({
        firstName: 'theo',
        lastName: 'Courant',
        isAnonymous: false,
        hasBeenAnonymised: true,
      });
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId: firstUser.id });
      databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId: secondUser.id });

      const firstProfileReward = databaseBuilder.factory.buildProfileReward({
        rewardId: attestation.id,
        userId: firstUser.id,
      });
      databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId,
        profileRewardId: firstProfileReward.id,
      });
      const secondProfileReward = databaseBuilder.factory.buildProfileReward({
        rewardId: attestation.id,
        userId: secondUser.id,
      });
      databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId,
        profileRewardId: secondProfileReward.id,
      });

      await databaseBuilder.commit();

      const results = await usecases.getSharedAttestationsForOrganizationByUserIds({
        attestationKey: attestation.key,
        organizationId,
        userIds: [firstUser.id, secondUser.id],
        locale,
      });

      expect(results).to.deep.equal({
        data: [],
        templateName: attestation.templateName,
      });
    });

    it('should return AttestationNotFound error if attestation does not exist', async function () {
      //given
      const locale = 'FR-fr';
      const firstUser = new User(databaseBuilder.factory.buildUser());

      databaseBuilder.factory.buildProfileReward({
        userId: firstUser.id,
      });
      await databaseBuilder.commit();

      //when
      const error = await catchErr(usecases.getSharedAttestationsForOrganizationByUserIds)({
        attestationKey: 'NOT_EXISTING_ATTESTATION',
        userIds: [firstUser.id],
        organizationId: 1,
        locale,
      });

      //then
      expect(error).to.be.an.instanceof(AttestationNotFoundError);
    });

    it('should return NoProfileRewardsFoundError error if there is no profile rewards', async function () {
      //given
      const locale = 'FR-fr';
      const attestation = databaseBuilder.factory.buildAttestation();
      const firstUser = new User(databaseBuilder.factory.buildUser({ firstName: 'Alex', lastName: 'Terieur' }));
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildProfileReward({
        rewardId: attestation.id,
        userId: firstUser.id,
      });

      await databaseBuilder.commit();

      //when
      const error = await catchErr(usecases.getSharedAttestationsForOrganizationByUserIds)({
        attestationKey: attestation.key,
        userIds: [firstUser.id],
        organizationId,
        locale,
      });

      //then
      expect(error).to.be.an.instanceOf(NoProfileRewardsFoundError);
    });
  });
});
