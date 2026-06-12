import sinon from 'sinon';

import { AttestationNotFoundError } from '../../../../../src/profile/domain/errors.js';
import { User } from '../../../../../src/profile/domain/models/User.js';
import { usecases } from '../../../../../src/profile/domain/usecases/index.js';
import { normalizeAndRemoveAccents } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { mockAttestationStorage } from '../../../../tooling/mocks/attestation-storage.mock.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Profile | Integration | Domain | get-attestation-data-for-users', function () {
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
    it('should return profile rewards', async function () {
      const locale = 'FR-fr';
      const attestation = databaseBuilder.factory.buildAttestation();
      mockAttestationStorage(attestation);
      const firstUser = new User(databaseBuilder.factory.buildUser({ firstName: 'alex', lastName: 'Terieur' }));
      const secondUser = new User(databaseBuilder.factory.buildUser({ firstName: 'theo', lastName: 'Courant' }));
      const firstCreatedAt = databaseBuilder.factory.buildProfileReward({
        rewardId: attestation.id,
        userId: firstUser.id,
      }).createdAt;
      const secondCreatedAt = databaseBuilder.factory.buildProfileReward({
        rewardId: attestation.id,
        userId: secondUser.id,
      }).createdAt;

      await databaseBuilder.commit();

      const results = await usecases.getAttestationDataForUsers({
        attestationKey: attestation.key,
        userIds: [firstUser.id, secondUser.id],
        locale,
      });

      expect(results.data).to.deep.equal([
        firstUser.toForm(firstCreatedAt, locale, normalizeAndRemoveAccents),
        secondUser.toForm(secondCreatedAt, locale, normalizeAndRemoveAccents),
      ]);
      expect(results.template).to.be.not.null;
      expect(results.data[0].get('firstName')).to.equal('ALEX');
      expect(results.data[0].get('lastName')).to.equal('TERIEUR');
      expect(results.data[1].get('firstName')).to.equal('THEO');
      expect(results.data[1].get('lastName')).to.equal('COURANT');
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
      const error = await catchErr(usecases.getAttestationDataForUsers)({
        attestationKey: 'NOT_EXISTING_ATTESTATION',
        userIds: [firstUser.id],
        locale,
      });

      //then
      expect(error).to.be.an.instanceof(AttestationNotFoundError);
    });
  });
});
