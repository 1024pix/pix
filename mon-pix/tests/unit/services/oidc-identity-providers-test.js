import Object from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { assert, module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | oidc-identity-providers', function (hooks) {
  setupTest(hooks);

  module('load', function () {
    test('should contain identity providers by id and retrieve the whole list', async function (assert) {
      // given
      const oidcPartner = {
        id: 'oidc-partner',
        code: 'OIDC_PARTNER',
        organizationName: 'Partenaire OIDC',
        slug: 'partenaire-oidc',
        shouldCloseSession: false,
        source: 'oidc-externe',
      };
      const oidcPartnerObject = Object.create(oidcPartner);
      const storeStub = Service.create({
        findAll: sinon.stub().resolves([oidcPartnerObject]),
        peekAll: sinon.stub().returns([oidcPartnerObject]),
      });
      const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
      oidcIdentityProvidersService.set('store', storeStub);

      // when
      await oidcIdentityProvidersService.load();

      // then
      assert.strictEqual(oidcIdentityProvidersService['oidc-partner'].code, oidcPartner.code);
      assert.strictEqual(oidcIdentityProvidersService['oidc-partner'].organizationName, oidcPartner.organizationName);
      assert.strictEqual(
        oidcIdentityProvidersService['oidc-partner'].shouldCloseSession,
        oidcPartner.shouldCloseSession,
      );
      assert.strictEqual(oidcIdentityProvidersService['oidc-partner'].source, oidcPartner.source);
      assert.strictEqual(oidcIdentityProvidersService.list[0].code, oidcPartner.code);
      assert.strictEqual(oidcIdentityProvidersService.list[0].organizationName, oidcPartner.organizationName);
      assert.strictEqual(oidcIdentityProvidersService.list[0].shouldCloseSession, oidcPartner.shouldCloseSession);
      assert.strictEqual(oidcIdentityProvidersService.list[0].source, oidcPartner.source);
    });
  });

  module('getIdentityProviderNamesByAuthenticationMethods', function () {
    test('should return identity provider names for methods', function (assert) {
      // given
      const methods = [{ identityProvider: 'FRANCE_CONNECT' }, { identityProvider: 'IMPOTS_GOUV' }];
      const oidcPartnerObject = Object.create({
        id: 'france-connect',
        code: 'FRANCE_CONNECT',
        organizationName: 'France Connect',
        shouldCloseSession: false,
        source: 'france-connect',
      });
      const otherOidcPartnerObject = Object.create({
        id: 'impots-gouv',
        code: 'IMPOTS_GOUV',
        organizationName: 'Impots.gouv',
        shouldCloseSession: false,
        source: 'impots-gouv',
      });
      const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
      oidcIdentityProvidersService.set(
        'store',
        Service.create({
          peekAll: sinon.stub().returns([oidcPartnerObject, otherOidcPartnerObject]),
        }),
      );

      // when
      const names = oidcIdentityProvidersService.getIdentityProviderNamesByAuthenticationMethods(methods);

      // expect
      assert.deepEqual(names, ['France Connect', 'Impots.gouv']);
    });
  });

  module('hasIdentityProviders', function () {
    module('when there is some identity providers', function () {
      test('returns true', async function () {
        // given
        const oidcPartner = {
          id: 'oidc-partner',
          code: 'OIDC_PARTNER',
          organizationName: 'Partenaire OIDC',
          slug: 'partenaire-oidc',
          shouldCloseSession: false,
          source: 'oidc-externe',
        };
        const oidcPartnerObject = Object.create(oidcPartner);
        const storeStub = Service.create({
          peekAll: sinon.stub().returns([oidcPartnerObject]),
        });
        const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const hasIdentityProviders = await oidcIdentityProvidersService.hasIdentityProviders;

        // then
        assert.strictEqual(hasIdentityProviders, true);
      });
    });

    module('when there is no identity providers', function () {
      test('returns false', async function () {
        // given
        const storeStub = Service.create({
          peekAll: sinon.stub().returns([]),
        });
        const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const hasIdentityProviders = await oidcIdentityProvidersService.hasIdentityProviders;

        // then
        assert.strictEqual(hasIdentityProviders, false);
      });
    });
  });

  module('featuredIdentityProvider', function () {
    module('when there is some identity providers containing a featured one', function () {
      test('returns the featured identity provider', async function () {
        // given
        const currentDomainService = this.owner.lookup('service:currentDomain');
        sinon.stub(currentDomainService, 'isFranceDomain').value(false);

        const oidcPartner = {
          id: 'fwb',
          code: 'FWB',
          organizationName: 'FWB',
          slug: 'fwb',
          shouldCloseSession: false,
          source: 'fwb',
        };
        const oidcPartnerObject = Object.create(oidcPartner);
        const storeStub = Service.create({
          peekAll: sinon.stub().returns([oidcPartnerObject]),
        });
        const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const featuredIdentityProvider = await oidcIdentityProvidersService.featuredIdentityProvider;

        // then
        assert.strictEqual(featuredIdentityProvider.id, oidcPartner.id);
        assert.strictEqual(featuredIdentityProvider.code, oidcPartner.code);
        assert.strictEqual(featuredIdentityProvider.organizationName, oidcPartner.organizationName);
        assert.strictEqual(featuredIdentityProvider.slug, oidcPartner.slug);
        assert.strictEqual(featuredIdentityProvider.shouldCloseSession, oidcPartner.shouldCloseSession);
        assert.strictEqual(featuredIdentityProvider.source, oidcPartner.source);
      });
    });

    module('when there is some identity providers but no featured one', function () {
      test('returns undefined', async function () {
        // given
        const oidcPartner = {
          id: 'oidc-partner',
          code: 'OIDC_PARTNER',
          organizationName: 'Partenaire OIDC',
          slug: 'partenaire-oidc',
          shouldCloseSession: false,
          source: 'oidc-externe',
        };
        const oidcPartnerObject = Object.create(oidcPartner);
        const storeStub = Service.create({
          peekAll: sinon.stub().returns([oidcPartnerObject]),
        });
        const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const featuredIdentityProvider = await oidcIdentityProvidersService.featuredIdentityProvider;

        // then
        assert.strictEqual(featuredIdentityProvider, undefined);
      });
    });

    module('when there isn’t any identity providers', function () {
      test('returns undefined', async function () {
        // given
        const storeStub = Service.create({
          peekAll: sinon.stub().returns([]),
        });
        const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const featuredIdentityProvider = await oidcIdentityProvidersService.featuredIdentityProvider;

        // then
        assert.strictEqual(featuredIdentityProvider, undefined);
      });
    });
  });

  module('hasOtherIdentityProviders', function () {
    module('when in France domain', function (hooks) {
      hooks.beforeEach(function () {
        const currentDomainService = this.owner.lookup('service:currentDomain');
        sinon.stub(currentDomainService, 'isFranceDomain').value(true);
      });

      module('when there is some other identity providers', function () {
        test('returns true', async function () {
          // given
          const oidcPartner = {
            id: 'oidc-partner',
            code: 'OIDC_PARTNER',
            organizationName: 'Partenaire OIDC',
            slug: 'partenaire-oidc',
            shouldCloseSession: false,
            source: 'oidc-externe',
          };
          const oidcPartnerObject = Object.create(oidcPartner);
          const storeStub = Service.create({
            peekAll: sinon.stub().returns([oidcPartnerObject]),
          });
          const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
          oidcIdentityProvidersService.set('store', storeStub);

          // when
          const hasOtherIdentityProviders = await oidcIdentityProvidersService.hasOtherIdentityProviders;

          // then
          assert.strictEqual(hasOtherIdentityProviders, true);
        });
      });

      module('when there isn’t any other identity providers', function () {
        test('returns false', async function () {
          // given
          const storeStub = Service.create({
            peekAll: sinon.stub().returns([]),
          });
          const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
          oidcIdentityProvidersService.set('store', storeStub);

          // when
          const hasOtherIdentityProviders = await oidcIdentityProvidersService.hasOtherIdentityProviders;

          // then
          assert.strictEqual(hasOtherIdentityProviders, false);
        });
      });
    });

    module('when not in France domain', function (hooks) {
      hooks.beforeEach(function () {
        const currentDomainService = this.owner.lookup('service:currentDomain');
        sinon.stub(currentDomainService, 'isFranceDomain').value(false);
      });

      test('returns false', async function () {
        // given
        const oidcPartner = {
          id: 'oidc-partner',
          code: 'OIDC_PARTNER',
          organizationName: 'Partenaire OIDC',
          slug: 'partenaire-oidc',
          shouldCloseSession: false,
          source: 'oidc-externe',
        };
        const oidcPartnerObject = Object.create(oidcPartner);
        const storeStub = Service.create({
          peekAll: sinon.stub().returns([oidcPartnerObject]),
        });
        const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const hasOtherIdentityProviders = await oidcIdentityProvidersService.hasOtherIdentityProviders;

        // then
        assert.strictEqual(hasOtherIdentityProviders, false);
      });
    });
  });

  module('shouldDisplayAccountRecoveryBanner', function () {
    test('returns true if SSO code is in USER_ACCOUNT_RECOVERY_FOR_IDENTITY_PROVIDER_CODES', async function (assert) {
      // given
      const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');

      // when
      const shouldDisplayAccountRecoveryBanner =
        await oidcIdentityProvidersService.shouldDisplayAccountRecoveryBanner('FER');

      // then
      assert.true(shouldDisplayAccountRecoveryBanner);
    });
  });
});
