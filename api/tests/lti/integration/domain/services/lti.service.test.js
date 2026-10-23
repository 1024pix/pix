import { expect } from 'chai';
import nock from 'nock';
import sinon from 'sinon';

import { config } from '../../../../../config/config.js';
import { InvalidLtiPlatformRegistrationError } from '../../../../../src/lti/domain/errors.js';
import { ltiService } from '../../../../../src/lti/domain/services/lti.service.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | LTI | Domain | Services | LTI', function () {
  describe('discoverLtiPlatform', function () {
    let ltiPlatform;

    beforeEach(async function () {
      ltiPlatform = domainBuilder.lti.buildLtiPlatform(databaseBuilder.factory.buildLtiPlatform());
      await databaseBuilder.commit();
    });

    it('discovers and validates platform’s open ID configuration', async function () {
      // given
      const { platformOpenIdConfig, platformOpenIdConfigUrl } =
        domainBuilder.lti.buildLtiPlatformRegistrationWithPlatformConfig();

      const { origin: platformOpenIdConfigOrigin, pathname: platformOpenIdConfigPathname } = new URL(
        platformOpenIdConfigUrl,
      );
      nock(platformOpenIdConfigOrigin).get(platformOpenIdConfigPathname).reply(200, platformOpenIdConfig);

      // when
      const result = await ltiService.discoverLtiPlatform(platformOpenIdConfigUrl);

      // then
      expect(result.ltiPlatform).to.deepEqualInstance(ltiPlatform);
      expect(result.platformConfiguration).to.deep.equal(platformOpenIdConfig);
    });

    describe('when fetching platform configuration fails', function () {
      it('throws InvalidLtiPlatformRegistrationError', async function () {
        // given
        const { platformOpenIdConfigUrl } = domainBuilder.lti.buildLtiPlatformRegistrationWithPlatformConfig();

        const { origin: platformOpenIdConfigOrigin, pathname: platformOpenIdConfigPathname } = new URL(
          platformOpenIdConfigUrl,
        );
        nock(platformOpenIdConfigOrigin).get(platformOpenIdConfigPathname).reply(500);

        // when
        const result = ltiService.discoverLtiPlatform(platformOpenIdConfigUrl);

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
        const { platformOpenIdConfigUrl } = domainBuilder.lti.buildLtiPlatformRegistrationWithPlatformConfig();

        const { origin: platformOpenIdConfigOrigin, pathname: platformOpenIdConfigPathname } = new URL(
          platformOpenIdConfigUrl,
        );
        nock(platformOpenIdConfigOrigin)
          .get(platformOpenIdConfigPathname)
          .reply(200, { name: 'invalid configuration' });

        // when
        const result = ltiService.discoverLtiPlatform(platformOpenIdConfigUrl);

        // then
        await expect(result).to.be.rejectedWith(
          InvalidLtiPlatformRegistrationError,
          'Invalid LTI platform configuration',
        );
      });
    });

    describe('when platform configuration URL origin is different from issuer', function () {
      it('throws InvalidLtiPlatformRegistrationError', async function () {
        // given
        const { platformOpenIdConfig, platformOpenIdConfigUrl } =
          domainBuilder.lti.buildLtiPlatformRegistrationWithPlatformConfig();

        const { pathname: platformOpenIdConfigPathname } = new URL(platformOpenIdConfigUrl);
        nock('https://moodle.different.net').get(platformOpenIdConfigPathname).reply(200, platformOpenIdConfig);

        // when
        const result = ltiService.discoverLtiPlatform(
          new URL(platformOpenIdConfigPathname, 'https://moodle.different.net').href,
        );

        // then
        await expect(result).to.be.rejectedWith(
          InvalidLtiPlatformRegistrationError,
          'Inconsistent LTI platform configuration URL',
        );
      });
    });

    describe('when issuer is not authorized', function () {
      it('throws InvalidLtiPlatformRegistrationError', async function () {
        // given
        const platformOpenIdConfigUrl = 'https://moodle.unauthorized.net/mod/lti/openid-configuration.php';
        const { platformOpenIdConfig } = domainBuilder.lti.buildLtiPlatformRegistrationWithPlatformConfig({
          platformOpenIdConfigUrl,
        });

        const { origin: platformOpenIdConfigOrigin, pathname: platformOpenIdConfigPathname } = new URL(
          platformOpenIdConfigUrl,
        );
        nock(platformOpenIdConfigOrigin).get(platformOpenIdConfigPathname).reply(200, platformOpenIdConfig);

        // when
        const result = ltiService.discoverLtiPlatform(platformOpenIdConfigUrl);

        // then
        await expect(result).to.be.rejectedWith(
          InvalidLtiPlatformRegistrationError,
          'Unauthorized LTI platform issuer',
        );
      });
    });
  });

  describe('createPixToolConfiguration', function () {
    it('creates Pix LTI tool configuration', function () {
      // given
      sinon.stub(config.domain, 'pixOrga').value('https://orga.test.pix');
      sinon.stub(config.domain, 'pixApp').value('https://app.test.pix');
      const expectedPixToolConfiguration = {
        response_types: ['id_token'],
        jwks_uri: 'https://api.dev.pix.fr/api/lti/keys',
        initiate_login_uri: 'https://api.dev.pix.fr/api/lti/init',
        grant_types: ['client_credentials', 'implicit'],
        redirect_uris: [
          'https://orga.test.pix.fr/api/lti/deep-linking',
          'https://app.test.pix.fr/api/lti/resource-link',
        ],
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
          target_link_uri: 'https://app.test.pix.fr/api/lti/resource-link',
          domain: 'app.test.pix.fr',
          description: 'Intégration avec la plateforme Pix',
          messages: [
            {
              type: 'LtiDeepLinkingRequest',
              target_link_uri: 'https://orga.test.pix.fr/api/lti/deep-linking',
            },
          ],
          claims: ['sub', 'iss', 'name', 'family_name', 'given_name', 'email'],
        },
      };

      // when
      const pixToolConfiguration = ltiService.createPixToolConfiguration();

      // then
      expect(pixToolConfiguration).to.deep.equal(expectedPixToolConfiguration);
    });
  });
});
