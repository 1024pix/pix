import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Domain | Usecases | get-account-recovery-details', function () {
  let temporaryKey, newEmail, firstName;

  beforeEach(function () {
    temporaryKey = 'FfgpFXgyuO062nPUPwcb8Wy3KcgkqR2p2GyEuGVaNI4=';
    newEmail = 'newEmail@example.net';
    firstName = 'Gertrude';
  });

  context('when user has no username and no GAR authentication method', function () {
    it('returns new email, firstName, hasScoUsername as false and hasGarAuthenticationMethod as false', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRawPassword({ firstName });
      databaseBuilder.factory.buildAccountRecoveryDemand({
        userId: user.id,
        temporaryKey,
        newEmail,
        used: false,
      });
      await databaseBuilder.commit();

      // when
      const recoveryDetails = await usecases.getAccountRecoveryDetails({ temporaryKey });

      // then
      expect(recoveryDetails.email).to.be.equal(newEmail.toLowerCase());
      expect(recoveryDetails.firstName).to.be.equal(firstName);
      expect(recoveryDetails.hasScoUsername).to.be.false;
      expect(recoveryDetails.hasGarAuthenticationMethod).to.be.false;
    });
  });

  context('when user has a username and no GAR authentication method', function () {
    it('returns new email, firstName, hasScoUsername as true and hasGarAuthenticationMethod as false', async function () {
      // given
      const username = 'gertrude.0202';
      const user = databaseBuilder.factory.buildUser.withRawPassword({ firstName, username });
      databaseBuilder.factory.buildAccountRecoveryDemand({
        userId: user.id,
        temporaryKey,
        newEmail,
        used: false,
      });
      await databaseBuilder.commit();

      // when
      const recoveryDetails = await usecases.getAccountRecoveryDetails({ temporaryKey });

      // then
      expect(recoveryDetails.email).to.be.equal(newEmail.toLowerCase());
      expect(recoveryDetails.firstName).to.be.equal(firstName);
      expect(recoveryDetails.hasScoUsername).to.be.true;
      expect(recoveryDetails.hasGarAuthenticationMethod).to.be.false;
    });
  });

  context('when user has a GAR authentication method', function () {
    it('returns new email, firstName, hasScoUsername as false and hasGarAuthenticationMethod as true', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRawPassword({ firstName });
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });
      databaseBuilder.factory.buildAccountRecoveryDemand({
        userId: user.id,
        temporaryKey,
        newEmail,
        used: false,
      });
      await databaseBuilder.commit();

      // when
      const recoveryDetails = await usecases.getAccountRecoveryDetails({ temporaryKey });

      // then
      expect(recoveryDetails.email).to.be.equal(newEmail.toLowerCase());
      expect(recoveryDetails.firstName).to.be.equal(firstName);
      expect(recoveryDetails.hasScoUsername).to.be.false;
      expect(recoveryDetails.hasGarAuthenticationMethod).to.be.true;
    });
  });
});
