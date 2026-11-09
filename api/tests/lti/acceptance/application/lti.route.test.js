import querystring from 'node:querystring';

import { expect } from 'chai';
import { parseSetCookie } from 'cookie';
import * as jose from 'jose';
import jsonwebtoken from 'jsonwebtoken';
import ms from 'ms';
import nock from 'nock';

import { config } from '../../../../config/config.js';
import { LtiDeepLinkingAccessToken } from '../../../../src/lti/domain/models/LtiDeepLinkingAccessToken.js';
import { LtiPlatformRegistration } from '../../../../src/lti/domain/models/LtiPlatformRegistration.js';
import { cryptoService } from '../../../../src/shared/domain/services/crypto-service.js';
import * as urlService from '../../../../src/shared/domain/services/url-service.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';
import { getServer } from '../../../tooling/server/shared-server.js';
import { generateInjectOptions } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | LTI | Route | LTI', function () {
  let server;

  beforeEach(async function () {
    server = await getServer();
  });

  describe('GET /api/lti/keys', function () {
    it('returns the list of all active public keys with an HTTP status code 200', async function () {
      // given
      const { id: platformId } = databaseBuilder.factory.buildLtiPlatform();
      const { publicKey } = databaseBuilder.factory.buildLtiPlatformRegistration({ platformId });
      const keyPair2 = await cryptoService.generateJSONWebKeyPair();
      databaseBuilder.factory.buildLtiPlatformRegistration({
        platformId,
        clientId: 'pending_client',
        status: 'pending',
        publicKey: keyPair2.publicKey,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: '/api/lti/keys',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({ keys: [publicKey] });
    });
  });

  describe('GET /api/lti/registration', function () {
    it('returns an html page acknowledging platform registration with an HTTP status code 200', async function () {
      //given
      const { id: platformId } = databaseBuilder.factory.buildLtiPlatform();
      await databaseBuilder.commit();

      const { clientId, platformOpenIdConfig, platformOpenIdConfigUrl, toolConfig } =
        domainBuilder.lti.buildLtiPlatformRegistrationWithPlatformConfig();

      const registrationToken = new jose.UnsecuredJWT({
        sub: clientId,
        scope: 'reg',
      })
        .setIssuedAt()
        .setExpirationTime('1h')
        .encode();

      const { origin: platformOrigin, pathname: platformConfigPath } = new URL(platformOpenIdConfigUrl);
      const platformConfigScope = nock(platformOrigin).get(platformConfigPath).reply(200, platformOpenIdConfig);

      const { pathname: registrationPath } = new URL(platformOpenIdConfig.registration_endpoint);
      const registrationScope = nock(platformOrigin)
        .post(registrationPath)
        .matchHeader('authorization', `Bearer ${registrationToken}`)
        .reply(200, toolConfig);

      const query = querystring.stringify({
        openid_configuration: platformOpenIdConfigUrl,
        registration_token: registrationToken,
      });

      const options = {
        method: 'GET',
        url: `/api/lti/registration?${query}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(
        `<!DOCTYPE html>
<html>
  <body>
    Registration successfull, please wait...
    <script type="text/javascript">
      (window.opener ?? window.parent).postMessage({ subject:'org.imsglobal.lti.close' }, '*');
    </script>
  </body>
</html>
`,
      );

      const registrations = await knex.select('clientId', 'platformId', 'status').from('lti_platform_registrations');
      expect(registrations).to.deep.equal([{ clientId, platformId, status: LtiPlatformRegistration.status.PENDING }]);

      expect(platformConfigScope.isDone()).to.be.true;
      expect(registrationScope.isDone()).to.be.true;
    });
  });

  describe('GET /api/lti/campaigns', function () {
    it('returns the lti campaigns of the organizations with an HTTP status code 200', async function () {
      // given
      const { id: platformId } = databaseBuilder.factory.buildLtiPlatform();
      const { clientId } = databaseBuilder.factory.buildLtiPlatformRegistration({ platformId });

      const organization = databaseBuilder.factory.buildOrganization({ name: 'Orga 1' });
      const otherOrganization = databaseBuilder.factory.buildOrganization({ name: 'Orga 2' });
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ description: 'Un profil cible' });
      databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
        name: 'Campagne 1',
        code: 'CAMPAIGN1',
        type: 'ASSESSMENT',
      });
      databaseBuilder.factory.buildCampaign({
        organizationId: otherOrganization.id,
        targetProfileId: targetProfile.id,
      });
      await databaseBuilder.commit();

      const ltiDeepLinkingAccessToken = new LtiDeepLinkingAccessToken({
        organizationIds: [organization.id],
        clientId,
        deepLinkingSettings: {},
        scope: 'lti-campaigns:read',
        audience: 'https://orga.pix.fr',
        sessionId: 'session-id',
      });

      const options = {
        method: 'GET',
        url: '/api/lti/campaigns',
        headers: {
          cookie: `jwtLtiDeepLinking=${ltiDeepLinkingAccessToken.encoded}`,
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'orga.pix.fr',
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).lengthOf(1);
      expect(response.result.data[0].type).to.equal('lti-campaigns');
    });

    describe('when there is no lti deep linking cookie', function () {
      it('returns an HTTP status code 401', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/lti/campaigns',
          headers: {
            cookie: `jwtLtiDeepLinking=`,
            'x-forwarded-proto': 'https',
            'x-forwarded-host': 'orga.pix.fr',
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    describe('when scope does not contain lti-campaigns:read', function () {
      it('returns an HTTP status code 403', async function () {
        // given
        const { id: platformId } = databaseBuilder.factory.buildLtiPlatform();
        const { clientId } = databaseBuilder.factory.buildLtiPlatformRegistration({ platformId });

        await databaseBuilder.commit();

        const ltiDeepLinkingAccessToken = new LtiDeepLinkingAccessToken({
          organizationIds: [1],
          clientId,
          deepLinkingSettings: {},
          scope: 'other-scope',
          audience: 'https://orga.pix.fr',
          sessionId: 'session-id',
        });

        const options = {
          method: 'GET',
          url: '/api/lti/campaigns',
          headers: {
            cookie: `jwtLtiDeepLinking=${ltiDeepLinkingAccessToken.encoded}`,
            'x-forwarded-proto': 'https',
            'x-forwarded-host': 'orga.pix.fr',
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.result.message).to.equal('Insufficient scope');
      });
    });
  });

  describe('POST /api/lti/select-campaign', function () {
    it('returns an auto-submit form posting a deep linking response to the platform with an HTTP status code 200', async function () {
      // given
      const { id: platformId } = databaseBuilder.factory.buildLtiPlatform();
      const { clientId } = databaseBuilder.factory.buildLtiPlatformRegistration({ platformId });

      const organization = databaseBuilder.factory.buildOrganization();
      const campaignId = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        code: 'CAMPAIGN1',
        type: 'PROFILES_COLLECTION',
      }).id;

      await databaseBuilder.commit();

      const deepLinkingSettings = {
        deep_link_return_url: 'https://moodle.example.net/mod/lti/contentitem_return.php',
      };

      const ltiDeepLinkingAccessToken = new LtiDeepLinkingAccessToken({
        organizationIds: [organization.id],
        clientId,
        deepLinkingSettings,
        scope: 'lti-campaigns:read other-scope',
        audience: 'https://orga.pix.fr',
        sessionId: 'session-id',
      });

      const options = {
        method: 'POST',
        url: '/api/lti/select-campaign',
        headers: {
          cookie: `jwtLtiDeepLinking=${ltiDeepLinkingAccessToken.encoded}`,
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'orga.pix.fr',
        },
        payload: { campaignId },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.equal('text/html; charset=utf-8');
      expect(response.payload).to.contain(
        '<form id="ltiAuthForm" name="ltiAuthForm" action="https://moodle.example.net/mod/lti/contentitem_return.php" method="POST"',
      );
    });

    describe('when there is no lti deep linking cookie', function () {
      it('returns an HTTP status code 401', async function () {
        // given
        const options = {
          method: 'POST',
          url: '/api/lti/select-campaign',
          headers: {
            cookie: `jwtLtiDeepLinking=`,
            'x-forwarded-proto': 'https',
            'x-forwarded-host': 'orga.pix.fr',
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    describe('when scope does not contain lti-campaigns:read', function () {
      it('returns an HTTP status code 403', async function () {
        // given
        const { id: platformId } = databaseBuilder.factory.buildLtiPlatform();
        const { clientId } = databaseBuilder.factory.buildLtiPlatformRegistration({ platformId });

        await databaseBuilder.commit();

        const ltiDeepLinkingAccessToken = new LtiDeepLinkingAccessToken({
          organizationIds: [1],
          clientId,
          deepLinkingSettings: {},
          scope: 'other-scope',
          audience: 'https://orga.pix.fr',
          sessionId: 'session-id',
        });

        const options = {
          method: 'POST',
          url: '/api/lti/select-campaign',
          headers: {
            cookie: `jwtLtiDeepLinking=${ltiDeepLinkingAccessToken.encoded}`,
            'x-forwarded-proto': 'https',
            'x-forwarded-host': 'orga.pix.fr',
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.result.message).to.equal('Insufficient scope');
      });
    });
  });

  describe('POST /api/lti/deep-linking', function () {
    it('returns https 302 status and sets a cookie', async function () {
      // given
      const { id: platformId } = databaseBuilder.factory.buildLtiPlatform({ issuer: 'https://moodle.example.net' });
      const { clientId } = databaseBuilder.factory.buildLtiPlatformRegistration({ platformId });
      const organization = databaseBuilder.factory.buildOrganization({ name: 'Orga 1' });
      await databaseBuilder.commit();

      const jwkPair = await cryptoService.generateJSONWebKeyPair();

      nock('https://moodle.example.net')
        .get('/mod/lti/openid-configuration.php')
        .reply(200, { jwks_uri: 'https://moodle.example.net/jwks' })
        .get('/jwks')
        .reply(200, { keys: [jwkPair.publicKey] });

      const ltiEncodedToken = jsonwebtoken.sign(
        {
          aud: clientId,
          'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingRequest',
          'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings': {},
          'https://purl.imsglobal.org/spec/lti/claim/custom': { pix_orgas: organization.externalId },
        },
        {
          format: 'jwk',
          key: jwkPair.privateKey,
        },
        {
          algorithm: 'RS256',
          keyid: jwkPair.publicKey.kid,
          expiresIn: 3600,
        },
        config.authentication.secret,
      );

      const options = generateInjectOptions({
        url: '/api/lti/deep-linking',
        method: 'POST',
        payload: {
          id_token: ltiEncodedToken,
        },
        audience: 'https://orga.pix.fr',
        urlEncodePayload: true,
      });

      const campaignSelectionPageUrl = urlService.getPixOrgaUrl('fr-FR', { pathname: '/lti-campaign-selection' });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(302);
      expect(response.headers.location).to.equal(campaignSelectionPageUrl);

      expect(response.headers).to.have.property('set-cookie');
      const parsedCookie = parseSetCookie(response.headers['set-cookie']);
      expect(parsedCookie).to.contain({
        name: 'jwtLtiDeepLinking',
        path: '/api/lti',
        maxAge: ms(config.lti.deepLinkingAccessTokenLifespan) / 1000,
      });
      expect(parsedCookie).to.have.property('value').that.is.not.empty;
    });
  });
});
