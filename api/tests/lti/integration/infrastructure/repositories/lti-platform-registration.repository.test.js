import { expect } from 'chai';

import { ltiPlatformRegistrationRepository } from '../../../../../src/lti/infrastructure/repositories/lti-platform-registration.repository.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | LTI | Infrastructure | Repository | lti-platform-registration', function () {
  describe('#findByClientId', function () {
    it('returns LTI platform registration information', async function () {
      // given
      const clientId = 'AbCD1234';

      const expectedLtiPlatformRegistration = domainBuilder.lti.buildLtiPlatformRegistration();

      const { platformId, platformIssuer } = expectedLtiPlatformRegistration;

      databaseBuilder.factory.buildLtiPlatform({ id: platformId, issuer: platformIssuer });
      databaseBuilder.factory.buildLtiPlatformRegistration({ ...expectedLtiPlatformRegistration, platformId });
      await databaseBuilder.commit();

      // when
      const registration = await ltiPlatformRegistrationRepository.findByClientId(clientId);

      // then
      expect(registration).to.deepEqualInstance(expectedLtiPlatformRegistration);
      expect(registration).to.have.property('platformId', platformId);
      expect(registration).to.have.property('platformIssuer', platformIssuer);
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
      const { id: platformId } = databaseBuilder.factory.buildLtiPlatform();
      databaseBuilder.factory.buildLtiPlatformRegistration({
        platformId,
        clientId: 'client1',
        status: 'pending',
      });
      const keyPair1 = await cryptoService.generateJSONWebKeyPair();
      databaseBuilder.factory.buildLtiPlatformRegistration({
        platformId,
        clientId: 'client2',
        publicKey: keyPair1.publicKey,
      });
      const keyPair2 = await cryptoService.generateJSONWebKeyPair();
      databaseBuilder.factory.buildLtiPlatformRegistration({
        platformId,
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
      // given
      const expectedLtiPlatformRegistration = domainBuilder.lti.buildLtiPlatformRegistration();
      const { platformId, platformIssuer } = expectedLtiPlatformRegistration;
      databaseBuilder.factory.buildLtiPlatform({ id: platformId, issuer: platformIssuer });
      await databaseBuilder.commit();

      // when
      const savedRegistration = await ltiPlatformRegistrationRepository.save(expectedLtiPlatformRegistration);

      // then
      expect(savedRegistration).to.deepEqualInstance(expectedLtiPlatformRegistration);
      expect(savedRegistration).to.have.property('platformId', platformId);
      expect(savedRegistration).to.have.property('platformIssuer', platformIssuer);

      const registrationFromDb = await knex.select('*').from('lti_platform_registrations').first();
      expect(registrationFromDb).to.deep.contain({
        clientId: expectedLtiPlatformRegistration.clientId,
        platformId,
        status: expectedLtiPlatformRegistration.status,
        toolConfig: expectedLtiPlatformRegistration.toolConfig,
        encryptedPrivateKey: expectedLtiPlatformRegistration.encryptedPrivateKey,
        publicKey: expectedLtiPlatformRegistration.publicKey,
        platformOpenIdConfigUrl: expectedLtiPlatformRegistration.platformOpenIdConfigUrl,
      });
    });
  });
});
