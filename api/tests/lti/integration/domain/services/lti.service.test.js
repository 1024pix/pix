import { expect } from 'chai';
import nock from 'nock';

import {
  InvalidLtiPlatformRegistrationError,
  LtiLineItemsInitializationError,
} from '../../../../../src/lti/domain/errors.js';
import { LtiCampaign } from '../../../../../src/lti/domain/models/LtiCampaign.js';
import { ltiService } from '../../../../../src/lti/domain/services/lti.service.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

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
      const expectedPixToolConfiguration = {
        response_types: ['id_token'],
        jwks_uri: 'https://auth.test.pix.fr/api/lti/keys',
        initiate_login_uri: 'https://auth.test.pix.fr/api/lti/init',
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
          custom_parameters: {},
        },
      };

      // when
      const pixToolConfiguration = ltiService.createPixToolConfiguration();

      // then
      expect(pixToolConfiguration).to.deep.equal(expectedPixToolConfiguration);
    });

    describe('when isDevelopmentPlatform is true', function () {
      it('adds custom claims with external organization ids', function () {
        // given
        const expectedPixToolConfiguration = {
          response_types: ['id_token'],
          jwks_uri: 'https://auth.test.pix.fr/api/lti/keys',
          initiate_login_uri: 'https://auth.test.pix.fr/api/lti/init',
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
            custom_parameters: {
              pix_orgas: 'SCO_SIECLE_MANAGING,SCO_NOT_MANAGING',
            },
          },
        };

        // when
        const pixToolConfiguration = ltiService.createPixToolConfiguration({ isDevelopmentPlatform: true });

        // then
        expect(pixToolConfiguration).to.deep.equal(expectedPixToolConfiguration);
      });
    });
  });

  describe('initializeLineItems', function () {
    const platformOrigin = 'https://moodle.example.net';
    const lineItemsUrl = `${platformOrigin}/mod/lti/services.php/2/lineitems?type_id=3`;
    const accessToken = { token_type: 'Bearer', access_token: 'platform-access-token' };

    let registration;

    beforeEach(function () {
      registration = domainBuilder.lti.buildLtiPlatformRegistration();
      registration.platformOpenIdConfig = { token_endpoint: `${platformOrigin}/mod/lti/token.php` };
    });

    function buildCampaign({ type = 'ASSESSMENT', competences } = {}) {
      return new LtiCampaign({
        id: 123,
        code: 'ABCD12345',
        name: 'Campagne',
        type,
        competences: competences ?? [
          { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3.4 },
          { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 5 },
        ],
      });
    }

    function mockTokenRequest() {
      return nock(platformOrigin).post('/mod/lti/token.php').reply(200, accessToken);
    }

    function mockLineItemsListing({ existingLineItems = [] } = {}) {
      return nock(platformOrigin, { reqheaders: { authorization: 'Bearer platform-access-token' } })
        .get('/mod/lti/services.php/2/lineitems')
        .query({ type_id: '3', tag: 'pix-campaign-123', limit: '1000' })
        .reply(200, existingLineItems);
    }

    function mockLineItemCreation({ createdLineItems, status = 201 }) {
      return nock(platformOrigin, {
        reqheaders: {
          authorization: 'Bearer platform-access-token',
          'content-type': 'application/vnd.ims.lis.v2.lineitem+json',
        },
      })
        .post('/mod/lti/services.php/2/lineitems', (body) => {
          createdLineItems.push(body);
          return true;
        })
        .query({ type_id: '3' })
        .times(1)
        .reply(status, {});
    }

    it('creates a line item per competence, then a mastery rate line item for an assessment campaign', async function () {
      // given
      const createdLineItems = [];
      mockTokenRequest();
      mockLineItemsListing();
      mockLineItemCreation({ createdLineItems });
      mockLineItemCreation({ createdLineItems });
      mockLineItemCreation({ createdLineItems });

      // when
      await ltiService.initializeLineItems({ lineItemsUrl, campaign: buildCampaign(), registration });

      // then
      expect(createdLineItems).to.deep.equal([
        {
          label: '1.1 Mener une recherche',
          resourceId: 'pix:campaign:123:competence:recCompetence1',
          scoreMaximum: 3,
          tag: 'pix-campaign-123',
        },
        {
          label: '1.2 Gérer des données',
          resourceId: 'pix:campaign:123:competence:recCompetence2',
          scoreMaximum: 5,
          tag: 'pix-campaign-123',
        },
        {
          label: 'Taux de réussite',
          resourceId: 'pix:campaign:123:mastery-rate',
          scoreMaximum: 100,
          tag: 'pix-campaign-123',
        },
      ]);
      expect(nock.isDone()).to.be.true;
    });

    it('creates a global Pix score line item for a profiles collection campaign', async function () {
      // given
      const createdLineItems = [];
      mockTokenRequest();
      mockLineItemsListing();
      mockLineItemCreation({ createdLineItems });

      const campaign = buildCampaign({
        type: 'PROFILES_COLLECTION',
        competences: [],
      });

      // when
      await ltiService.initializeLineItems({ lineItemsUrl, campaign, registration });

      // then
      expect(createdLineItems).to.deep.equal([
        {
          label: 'Score Pix global',
          resourceId: 'pix:campaign:123:pix-score',
          scoreMaximum: 1024,
          tag: 'pix-campaign-123',
        },
      ]);
    });

    it('does not create line items that already exist on the platform', async function () {
      // given
      const createdLineItems = [];
      mockTokenRequest();
      mockLineItemsListing({
        existingLineItems: [
          { id: 'https://moodle.example.net/1', resourceId: 'pix:campaign:123:competence:recCompetence1' },
          { id: 'https://moodle.example.net/3', resourceId: 'pix:campaign:123:mastery-rate' },
        ],
      });
      mockLineItemCreation({ createdLineItems });

      // when
      await ltiService.initializeLineItems({ lineItemsUrl, campaign: buildCampaign(), registration });

      // then
      expect(createdLineItems.map(({ resourceId }) => resourceId)).to.deep.equal([
        'pix:campaign:123:competence:recCompetence2',
      ]);
    });

    it('creates nothing when every line item already exists', async function () {
      // given
      mockTokenRequest();
      mockLineItemsListing({
        existingLineItems: [
          { resourceId: 'pix:campaign:123:competence:recCompetence1' },
          { resourceId: 'pix:campaign:123:competence:recCompetence2' },
          { resourceId: 'pix:campaign:123:mastery-rate' },
        ],
      });

      // when / then
      await ltiService.initializeLineItems({ lineItemsUrl, campaign: buildCampaign(), registration });
      expect(nock.isDone()).to.be.true;
    });

    describe('when the line items URL is missing', function () {
      it('throws a LtiLineItemsInitializationError', async function () {
        // when
        const error = await catchErr(ltiService.initializeLineItems)({
          lineItemsUrl: undefined,
          campaign: buildCampaign(),
          registration,
        });

        // then
        expect(error).to.be.instanceOf(LtiLineItemsInitializationError);
      });
    });

    describe('when the access token cannot be retrieved', function () {
      it('throws a LtiLineItemsInitializationError', async function () {
        // given
        nock(platformOrigin).post('/mod/lti/token.php').reply(401, { error: 'invalid_scope' });

        // when
        const error = await catchErr(ltiService.initializeLineItems)({
          lineItemsUrl,
          campaign: buildCampaign(),
          registration,
        });

        // then
        expect(error).to.be.instanceOf(LtiLineItemsInitializationError);
      });
    });

    describe('when existing line items cannot be listed', function () {
      it('throws a LtiLineItemsInitializationError without creating anything', async function () {
        // given
        mockTokenRequest();
        nock(platformOrigin).get('/mod/lti/services.php/2/lineitems').query(true).reply(500);

        // when
        const error = await catchErr(ltiService.initializeLineItems)({
          lineItemsUrl,
          campaign: buildCampaign(),
          registration,
        });

        // then
        expect(error).to.be.instanceOf(LtiLineItemsInitializationError);
      });
    });

    describe('when a line item cannot be created', function () {
      it('throws a LtiLineItemsInitializationError and stops creating line items', async function () {
        // given
        const createdLineItems = [];
        mockTokenRequest();
        mockLineItemsListing();
        mockLineItemCreation({ createdLineItems, status: 500 });

        // when
        const error = await catchErr(ltiService.initializeLineItems)({
          lineItemsUrl,
          campaign: buildCampaign(),
          registration,
        });

        // then
        expect(error).to.be.instanceOf(LtiLineItemsInitializationError);
        expect(createdLineItems).to.have.lengthOf(1);
      });
    });
  });

  describe('deserializeDeepLinkingCustomClaims', function () {
    it('deserializes organization external ids', function () {
      // given
      const customClaims = { pix_orgas: 'EXTERNAL_ID_123 , EXTERNAL_ID_456,', other: 'discarded' };

      // when
      const result = ltiService.deserializeDeepLinkingCustomClaims(customClaims);

      // then
      expect(result).to.deep.equal({
        organizationExternalIds: ['EXTERNAL_ID_123', 'EXTERNAL_ID_456'],
      });
    });

    describe('when pix_orgas is missing', function () {
      it('returns an empty array for organization external ids', function () {
        // given
        const customClaims = { other: 'discarded' };

        // when
        const result = ltiService.deserializeDeepLinkingCustomClaims(customClaims);

        // then
        expect(result).to.deep.equal({
          organizationExternalIds: [],
        });
      });
    });
  });
});
