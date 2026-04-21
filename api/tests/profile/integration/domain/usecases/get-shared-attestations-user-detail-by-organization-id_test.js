import sinon from 'sinon';

import { AttestationNotFoundError } from '../../../../../src/profile/domain/errors.js';
import { AttestationUserDetail } from '../../../../../src/profile/domain/models/AttestationUserDetail.js';
import { User } from '../../../../../src/profile/domain/models/User.js';
import { usecases } from '../../../../../src/profile/domain/usecases/index.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { buildAttestationUserDetail } from '../../../../tooling/domain-builder/factory/index.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Profile | Integration | Domain | get-shared-attestations-user-detail-by-organization-id', function () {
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

  describe('#getSharedAttestationsUserDetailByOrganizationId', function () {
    it('should return array of AttestationUserDetail by organizationId', async function () {
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

      const results = await usecases.getSharedAttestationsUserDetailByOrganizationId({
        attestationKey: attestation.key,
        organizationId,
        locale,
      });

      expect(results[0]).to.be.instanceOf(AttestationUserDetail);
      expect(results).to.deep.equal([
        buildAttestationUserDetail({
          attestationKey: attestation.key,
          obtainedAt: firstProfileReward.createdAt,
          userId: firstUser.id,
        }),
        buildAttestationUserDetail({
          attestationKey: attestation.key,
          obtainedAt: secondProfileReward.createdAt,
          userId: secondUser.id,
        }),
      ]);
      expect(results[0].obtainedAt).to.deep.equal(firstProfileReward.createdAt);
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
        organizationId: 1,
        locale,
      });

      //then
      expect(error).to.be.an.instanceof(AttestationNotFoundError);
    });

    it('should return empty array if there is no profile rewards', async function () {
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
      const results = await usecases.getSharedAttestationsUserDetailByOrganizationId({
        attestationKey: attestation.key,
        organizationId,
        locale,
      });

      //then
      expect(results).to.deep.equal([]);
    });
  });
});
