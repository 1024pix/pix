import { AttestationNotFoundError } from '../../../../../src/profile/domain/errors.js';
import { User } from '../../../../../src/profile/domain/models/User.js';
import { usecases } from '../../../../../src/profile/domain/usecases/index.js';
import { catchErr, databaseBuilder, expect, sinon } from '../../../../test-helper.js';

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
      const firstUser = new User(databaseBuilder.factory.buildUser({ firstName: 'Alex', lastName: 'Terieur' }));
      const secondUser = new User(databaseBuilder.factory.buildUser({ firstName: 'Theo', lastName: 'Courant' }));
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

      expect(results).to.deep.equal({
        data: [firstUser.toForm(firstCreatedAt, locale), secondUser.toForm(secondCreatedAt, locale)],
        templateName: attestation.templateName,
      });
      expect(results.data[0].get('fullName')).to.equal('Alex TERIEUR');
      expect(results.data[1].get('fullName')).to.equal('Theo COURANT');
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
