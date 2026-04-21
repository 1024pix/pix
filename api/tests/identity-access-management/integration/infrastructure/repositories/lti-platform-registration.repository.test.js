import { ltiPlatformRegistrationRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/lti-platform-registration.repository.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Identity Access Management | Infrastructure | Repository | lti-platform-registration', function () {
  describe('#findByClientId', function () {
    it('returns LTI platform registration information', async function () {
      // given
      const clientId = 'AbCD1234';
      const expectedLtiPlatformRegistration = domainBuilder.identityAccessManagement.buildLtiPlatformRegistration();

      databaseBuilder.factory.buildLtiPlatformRegistration(expectedLtiPlatformRegistration);
      await databaseBuilder.commit();

      // when
      const registration = await ltiPlatformRegistrationRepository.findByClientId(clientId);

      // then
      expect(registration).to.deepEqualInstance(expectedLtiPlatformRegistration);
    });

    it('returns null when no LTI platforms are found', async function () {
      // given
      const clientId = 'NOT-FOUND';

      // when
      const registration = await ltiPlatformRegistrationRepository.findByClientId(clientId);

      // then
      expect(registration).to.be.null;
    });
  });

  describe('#listActivePublicKeys', function () {
    it('returns the list of public keys of the active platforms', async function () {
      // given
      databaseBuilder.factory.buildLtiPlatformRegistration({
        clientId: 'client1',
        status: 'pending',
      });
      const keyPair1 = await cryptoService.generateJSONWebKeyPair();
      databaseBuilder.factory.buildLtiPlatformRegistration({
        clientId: 'client2',
        publicKey: keyPair1.publicKey,
      });
      const keyPair2 = await cryptoService.generateJSONWebKeyPair();
      databaseBuilder.factory.buildLtiPlatformRegistration({
        clientId: 'client3',
        publicKey: keyPair2.publicKey,
      });
      await databaseBuilder.commit();

      // when
      const keys = await ltiPlatformRegistrationRepository.listActivePublicKeys();

      // then
      expect(keys).to.deep.contain.members([keyPair1.publicKey, keyPair2.publicKey]);
    });
  });

  describe('#save', function () {
    it('inserts platform registration', async function () {
      const expectedLtiPlatformRegistration = domainBuilder.identityAccessManagement.buildLtiPlatformRegistration();

      // when
      await ltiPlatformRegistrationRepository.save(expectedLtiPlatformRegistration);

      // then
      const registration = await knex('lti_platform_registrations').select('*').first();
      expect(registration.clientId).to.deep.equal(expectedLtiPlatformRegistration.clientId);
      expect(registration.platformOrigin).to.deep.equal(expectedLtiPlatformRegistration.platformOrigin);
      expect(registration.status).to.deep.equal(expectedLtiPlatformRegistration.status);
      expect(registration.toolConfig).to.deep.equal(expectedLtiPlatformRegistration.toolConfig);
      expect(registration.encryptedPrivateKey).to.deep.equal(expectedLtiPlatformRegistration.encryptedPrivateKey);
      expect(registration.publicKey).to.deep.equal(expectedLtiPlatformRegistration.publicKey);
      expect(registration.platformOpenIdConfigUrl).to.deep.equal(
        expectedLtiPlatformRegistration.platformOpenIdConfigUrl,
      );
    });
  });
});
