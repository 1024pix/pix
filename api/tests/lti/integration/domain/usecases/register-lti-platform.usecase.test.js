import { expect } from 'chai';
import nock from 'nock';

import { InvalidLtiPlatformRegistrationError } from '../../../../../src/lti/domain/errors.js';
import { LtiPlatformRegistration } from '../../../../../src/lti/domain/models/LtiPlatformRegistration.js';
import { usecases } from '../../../../../src/lti/domain/usecases/index.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | LTI | Domain | Usecases | register-lti-platform', function () {
  let ltiPlatform;

  beforeEach(async function () {
    ltiPlatform = domainBuilder.lti.buildLtiPlatform(databaseBuilder.factory.buildLtiPlatform());
    await databaseBuilder.commit();
  });

  it('discovers platform’s open ID configuration and register Pix configuration on the platform', async function () {
    // given
    const { platformOpenIdConfig, platformOpenIdConfigUrl, toolConfig } =
      domainBuilder.lti.buildLtiPlatformRegistrationWithPlatformConfig();
    const registrationToken = 'token1234';

    const { origin: platformOpenIdConfigOrigin, pathname: platformOpenIdConfigPathname } = new URL(
      platformOpenIdConfigUrl,
    );
    nock(platformOpenIdConfigOrigin).get(platformOpenIdConfigPathname).reply(200, platformOpenIdConfig);

    const { origin: platformRegistrationOrigin, pathname: platformRegistrationPathname } = new URL(
      platformOpenIdConfig.registration_endpoint,
    );
    nock(platformRegistrationOrigin)
      .post(platformRegistrationPathname)
      .matchHeader('authorization', `Bearer ${registrationToken}`)
      .reply(200, toolConfig);

    const expectedLtiPlatformRegistration = {
      clientId: toolConfig.client_id,
      status: LtiPlatformRegistration.status.PENDING,
      platformId: ltiPlatform.id,
      toolConfig,
      platformOpenIdConfigUrl,
    };

    // when
    const savedRegistration = await usecases.registerLtiPlatform({
      platformConfigurationUrl: platformOpenIdConfigUrl,
      registrationToken,
    });

    // then
    expect(savedRegistration).to.be.instanceOf(LtiPlatformRegistration);
    expect(savedRegistration).to.deep.contain(expectedLtiPlatformRegistration);
    expect(savedRegistration).to.have.property('publicKey').that.is.an('object');
    expect(savedRegistration).to.have.property('encryptedPrivateKey').that.is.a('string');

    const savedPlatformRegistrations = await knex.select('*').from('lti_platform_registrations');
    expect(savedPlatformRegistrations).to.have.lengthOf(1);
    expect(savedPlatformRegistrations[0]).to.deep.contain(expectedLtiPlatformRegistration);
    expect(savedPlatformRegistrations[0]).to.have.property('publicKey').that.is.an('object');
    expect(savedPlatformRegistrations[0]).to.have.property('encryptedPrivateKey').that.is.a('string');
  });

  describe('when platform’s issuer is http://localhost:8000', function () {
    it('activates registration by default', async function () {
      // given
      databaseBuilder.factory.buildLtiPlatform({ issuer: 'http://localhost:8000' });
      await databaseBuilder.commit();

      const { platformOpenIdConfig, platformOpenIdConfigUrl, toolConfig } =
        domainBuilder.lti.buildLtiPlatformRegistrationWithPlatformConfig({
          platformOpenIdConfigUrl: 'http://localhost:8000/mod/lti/openid-configuration.php',
        });
      const registrationToken = 'token1234';

      const { origin: platformOpenIdConfigOrigin, pathname: platformOpenIdConfigPathname } = new URL(
        platformOpenIdConfigUrl,
      );
      nock(platformOpenIdConfigOrigin).get(platformOpenIdConfigPathname).reply(200, platformOpenIdConfig);

      const { origin: platformRegistrationOrigin, pathname: platformRegistrationPathname } = new URL(
        platformOpenIdConfig.registration_endpoint,
      );
      nock(platformRegistrationOrigin)
        .post(platformRegistrationPathname)
        .matchHeader('authorization', `Bearer ${registrationToken}`)
        .reply(200, toolConfig);

      // when
      const savedRegistration = await usecases.registerLtiPlatform({
        platformConfigurationUrl: platformOpenIdConfigUrl,
        registrationToken,
      });

      // then
      expect(savedRegistration).to.have.property('status', LtiPlatformRegistration.status.ACTIVE);

      const savedPlatformRegistrations = await knex.select('status').from('lti_platform_registrations');
      expect(savedPlatformRegistrations).to.have.lengthOf(1);
      expect(savedPlatformRegistrations[0]).to.have.property('status', LtiPlatformRegistration.status.ACTIVE);
    });
  });

  describe('when registration endpoint fails', function () {
    it('throws InvalidLtiPlatformRegistrationError', async function () {
      // given
      const { platformOpenIdConfig, platformOpenIdConfigUrl } =
        domainBuilder.lti.buildLtiPlatformRegistrationWithPlatformConfig();

      const { origin: platformOpenIdConfigOrigin, pathname: platformOpenIdConfigPathname } = new URL(
        platformOpenIdConfigUrl,
      );
      nock(platformOpenIdConfigOrigin).get(platformOpenIdConfigPathname).reply(200, platformOpenIdConfig);

      const { origin: platformRegistrationOrigin, pathname: platformRegistrationPathname } = new URL(
        platformOpenIdConfig.registration_endpoint,
      );
      nock(platformRegistrationOrigin).post(platformRegistrationPathname).reply(400);

      // when
      const result = usecases.registerLtiPlatform({
        platformConfigurationUrl: platformOpenIdConfigUrl,
        registrationToken: 'token1234',
      });

      // then
      await expect(result).to.be.rejectedWith(
        InvalidLtiPlatformRegistrationError,
        'Registration with the platform failed',
      );

      const savedPlatformRegistrations = await knex('lti_platform_registrations').select('*');
      expect(savedPlatformRegistrations).to.be.empty;
    });
  });
});
