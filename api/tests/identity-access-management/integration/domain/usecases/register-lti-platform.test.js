import sinon from 'sinon';

import { InvalidLtiPlatformRegistrationError } from '../../../../../src/identity-access-management/domain/errors.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { ltiPlatformRegistrationRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/lti-platform-registration.repository.js';
import { expect } from '../../../../test-helper.js';
import { knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Identity Access Management | Domain | Usecases | register-lti-platform', function () {
  it('discovers platform’s open ID configuration and register Pix configuration on the platform', async function () {
    // given
    const { platformOpenIdConfig, platformOpenIdConfigUrl, platformOrigin, toolConfig } =
      domainBuilder.identityAccessManagement.buildLtiPlatformRegistrationWithPlatformConfig();

    const expectedPixConfig = {
      response_types: ['id_token'],
      jwks_uri: 'https://api.test.pix.fr/api/lti/keys',
      initiate_login_uri: 'https://api.test.pix.fr/api/lti/init',
      grant_types: ['client_credentials', 'implicit'],
      redirect_uris: ['https://api.test.pix.fr/api/lti/launch'],
      application_type: 'web',
      token_endpoint_auth_method: 'private_key_jwt',
      client_name: 'Pix',
      logo_uri: 'https://app.pix.fr/images/pix-logo.svg',
      scope: [
        'https://purl.imsglobal.org/spec/lti-ags/scope/score',
        'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
        'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
        'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
      ].join(' '),
      'https://purl.imsglobal.org/spec/lti-tool-configuration': {
        target_link_uri: 'https://api.test.pix.fr/api/lti',
        domain: 'api.test.pix.fr',
        description: 'Intégration avec la plateforme Pix',
        messages: [
          {
            type: 'LtiDeepLinkingRequest',
            target_link_uri: 'https://api.test.pix.fr/api/lti/content-selection',
          },
        ],
        claims: ['sub', 'iss', 'name', 'family_name', 'given_name', 'email'],
      },
    };

    const publicKey = { kty: 'test' };
    const privateKey = Symbol('privateKey');
    const encryptedPrivateKey = 'encryptedPrivateKey';
    const expectedLtiPlatformRegistration = {
      clientId: toolConfig.client_id,
      platformOrigin,
      toolConfig,
      platformOpenIdConfigUrl,
      publicKey,
      encryptedPrivateKey,
    };

    const httpAgent = {
      get: sinon.stub().resolves({ code: 200, isSuccessful: true, data: platformOpenIdConfig }),
      post: sinon.stub().resolves({ code: 201, isSuccessful: true, data: toolConfig }),
    };

    const cryptoService = {
      generateJSONWebKeyPair: sinon.stub().resolves({ privateKey, publicKey }),
      encrypt: sinon.stub().resolves(encryptedPrivateKey),
    };

    const dependencies = { httpAgent, ltiPlatformRegistrationRepository, cryptoService };

    // when
    await usecases.registerLtiPlatform({
      platformConfigurationUrl: platformOpenIdConfigUrl,
      registrationToken: 'token1234',
      ...dependencies,
    });

    // then
    expect(httpAgent.get).to.have.been.calledWith({
      url: platformOpenIdConfigUrl,
      headers: { Accept: 'application/json' },
    });
    expect(httpAgent.post).to.have.been.calledWith({
      url: platformOpenIdConfig.registration_endpoint,
      headers: {
        Authorization: 'Bearer token1234',
      },
      payload: expectedPixConfig,
    });

    expect(cryptoService.generateJSONWebKeyPair).to.have.been.calledOnce;
    expect(cryptoService.encrypt).to.have.been.calledWith(JSON.stringify(privateKey));

    const savedPlatformRegistrations = await knex('lti_platform_registrations').select('*');
    expect(savedPlatformRegistrations).to.have.lengthOf(1);
    expect(savedPlatformRegistrations[0]).to.deep.contain(expectedLtiPlatformRegistration);
  });

  describe('when fetching platform configuration fails', function () {
    it('throws InvalidLtiPlatformRegistrationError', async function () {
      // given
      const { platformOpenIdConfigUrl } =
        domainBuilder.identityAccessManagement.buildLtiPlatformRegistrationWithPlatformConfig({
          platformOrigin: 'https://moodle.unknown.net',
        });

      const httpAgent = {
        get: sinon.stub().resolves({ code: 404, isSuccessful: false }),
      };
      const dependencies = { httpAgent };

      // when
      const result = usecases.registerLtiPlatform({
        platformConfigurationUrl: platformOpenIdConfigUrl,
        ...dependencies,
      });

      // then
      await expect(result).to.be.rejectedWith(
        InvalidLtiPlatformRegistrationError,
        'Could not fetch platform configuration',
      );
    });
  });

  describe('when platform configuration is invalid', function () {
    it('throws InvalidLtiPlatformRegistrationError', async function () {
      // given
      const { platformOpenIdConfigUrl } =
        domainBuilder.identityAccessManagement.buildLtiPlatformRegistrationWithPlatformConfig({
          platformOrigin: 'https://moodle.unauthorized.net',
        });

      const httpAgent = {
        get: sinon.stub().resolves({ code: 200, isSuccessful: true, data: { name: 'invalid configuration' } }),
      };
      const dependencies = { httpAgent };

      // when
      const result = usecases.registerLtiPlatform({
        platformConfigurationUrl: platformOpenIdConfigUrl,
        ...dependencies,
      });

      // then
      await expect(result).to.be.rejectedWith(
        InvalidLtiPlatformRegistrationError,
        'Invalid LTI platform configuration',
      );
    });
  });

  describe('when issuer is not authorized', function () {
    it('throws InvalidLtiPlatformRegistrationError', async function () {
      // given
      const { platformOpenIdConfig, platformOpenIdConfigUrl } =
        domainBuilder.identityAccessManagement.buildLtiPlatformRegistrationWithPlatformConfig({
          platformOrigin: 'https://moodle.unauthorized.net',
        });

      const httpAgent = { get: sinon.stub().resolves({ code: 200, isSuccessful: true, data: platformOpenIdConfig }) };
      const dependencies = { httpAgent };

      // when
      const result = usecases.registerLtiPlatform({
        platformConfigurationUrl: platformOpenIdConfigUrl,
        ...dependencies,
      });

      // then
      await expect(result).to.be.rejectedWith(InvalidLtiPlatformRegistrationError, 'Unauthorized LTI platform issuer');
    });
  });

  describe('when platform configuration URL origin is different from issuer', function () {
    it('throws InvalidLtiPlatformRegistrationError', async function () {
      // given
      const { platformOpenIdConfig, platformOpenIdConfigUrl } =
        domainBuilder.identityAccessManagement.buildLtiPlatformRegistrationWithPlatformConfig();

      const httpAgent = { get: sinon.stub().resolves({ code: 200, isSuccessful: true, data: platformOpenIdConfig }) };
      const dependencies = { httpAgent };

      const differentPlatformUrl = new URL(new URL(platformOpenIdConfigUrl).pathname, 'https://moodle.different.net')
        .href;

      // when
      const result = usecases.registerLtiPlatform({
        platformConfigurationUrl: differentPlatformUrl,
        ...dependencies,
      });

      // then
      await expect(result).to.be.rejectedWith(
        InvalidLtiPlatformRegistrationError,
        'Inconsistent LTI platform configuration URL',
      );
    });
  });

  describe('when registration endpoint fails', function () {
    it('throws InvalidLtiPlatformRegistrationError', async function () {
      // given
      const { platformOpenIdConfig, platformOpenIdConfigUrl } =
        domainBuilder.identityAccessManagement.buildLtiPlatformRegistrationWithPlatformConfig();

      const expectedPixConfig = {
        response_types: ['id_token'],
        jwks_uri: 'https://api.test.pix.fr/api/lti/keys',
        initiate_login_uri: 'https://api.test.pix.fr/api/lti/init',
        grant_types: ['client_credentials', 'implicit'],
        redirect_uris: ['https://api.test.pix.fr/api/lti/launch'],
        application_type: 'web',
        token_endpoint_auth_method: 'private_key_jwt',
        client_name: 'Pix',
        logo_uri: 'https://app.pix.fr/images/pix-logo.svg',
        scope: [
          'https://purl.imsglobal.org/spec/lti-ags/scope/score',
          'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
          'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
          'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
        ].join(' '),
        'https://purl.imsglobal.org/spec/lti-tool-configuration': {
          target_link_uri: 'https://api.test.pix.fr/api/lti',
          domain: 'api.test.pix.fr',
          description: 'Intégration avec la plateforme Pix',
          messages: [
            {
              type: 'LtiDeepLinkingRequest',
              target_link_uri: 'https://api.test.pix.fr/api/lti/content-selection',
            },
          ],
          claims: ['sub', 'iss', 'name', 'family_name', 'given_name', 'email'],
        },
      };

      const httpAgent = {
        get: sinon.stub().resolves({ code: 200, isSuccessful: true, data: platformOpenIdConfig }),
        post: sinon.stub().resolves({ code: 400, isSuccessful: false }),
      };

      const dependencies = { httpAgent, ltiPlatformRegistrationRepository };

      // when
      const result = usecases.registerLtiPlatform({
        platformConfigurationUrl: platformOpenIdConfigUrl,
        registrationToken: 'token1234',
        ...dependencies,
      });

      // then
      await expect(result).to.be.rejectedWith(
        InvalidLtiPlatformRegistrationError,
        'Registration with the platform failed',
      );
      expect(httpAgent.get).to.have.been.calledWith({
        url: platformOpenIdConfigUrl,
        headers: { Accept: 'application/json' },
      });
      expect(httpAgent.post).to.have.been.calledWith({
        url: platformOpenIdConfig.registration_endpoint,
        headers: {
          Authorization: 'Bearer token1234',
        },
        payload: expectedPixConfig,
      });

      const savedPlatformRegistrations = await knex('lti_platform_registrations').select('*');
      expect(savedPlatformRegistrations).to.be.empty;
    });
  });
});
