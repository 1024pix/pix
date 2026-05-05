import Object from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { assert, module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | oidc-identity-providers', function (hooks) {
  setupTest(hooks);

  let oidcIdentityProvidersService;
  let storeStub;

  const oidcPartner = {
    id: 'oidc-partner',
    code: 'OIDC_PARTNER',
    slug: 'partenaire-oidc',
    organizationName: 'Partenaire OIDC',
    shouldCloseSession: false,
    source: 'oidc-externe',
    isVisible: true,
  };

  const nonVisibleIdentityProvider = {
    id: 'oidc-partner',
    code: 'OIDC_PARTNER',
    slug: 'partenaire-oidc',
    organizationName: 'Partenaire OIDC',
    shouldCloseSession: false,
    source: 'oidc-externe',
    isVisible: false,
  };

  hooks.beforeEach(function () {
    oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
  });

  module('load', function () {
    test('should contain identity providers by id and retrieve the whole list', async function (assert) {
      // given
      storeStub = Service.create({
        findAll: sinon.stub().resolves([oidcPartner]),
        peekAll: sinon.stub().returns([oidcPartner]),
      });
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

  module('list', function () {
    test('lists all identity providers loaded', async function (assert) {
      // given
      storeStub = Service.create({
        findAll: sinon.stub().resolves([Object.create(oidcPartner)]),
        peekAll: sinon.stub().returns([Object.create(oidcPartner)]),
      });
      oidcIdentityProvidersService.set('store', storeStub);

      // when
      const allProviders = oidcIdentityProvidersService.list;

      // then
      assert.strictEqual(allProviders.length, 1);
      assert.strictEqual(allProviders[0].code, oidcPartner.code);
    });
  });

  module('visibleIdentityProviders', function () {
    test('lists all the loaded visible identity providers', async function (assert) {
      // given
      storeStub = Service.create({
        findAll: sinon.stub().resolves([Object.create(nonVisibleIdentityProvider), Object.create(oidcPartner)]),
        peekAll: sinon.stub().returns([Object.create(nonVisibleIdentityProvider), Object.create(oidcPartner)]),
      });
      oidcIdentityProvidersService.set('store', storeStub);

      // when
      const visibleIdentityProviders = oidcIdentityProvidersService.visibleIdentityProviders;

      // then
      assert.strictEqual(visibleIdentityProviders.length, 1);
      assert.strictEqual(visibleIdentityProviders[0].code, oidcPartner.code);
    });
  });

  module('hasVisibleIdentityProviders', function () {
    module('when there is at least one visible identity provider', function () {
      test('returns true', async function (assert) {
        // given
        storeStub = Service.create({
          findAll: sinon.stub().resolves([Object.create(nonVisibleIdentityProvider), Object.create(oidcPartner)]),
          peekAll: sinon.stub().returns([Object.create(nonVisibleIdentityProvider), Object.create(oidcPartner)]),
        });
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const hasVisibleIdentityProviders = oidcIdentityProvidersService.hasVisibleIdentityProviders;

        // then
        assert.true(hasVisibleIdentityProviders);
      });
    });

    module('when there is no visible identity provider', function () {
      test('returns false', async function (assert) {
        // given
        storeStub = Service.create({
          findAll: sinon.stub().resolves([Object.create(nonVisibleIdentityProvider)]),
          peekAll: sinon.stub().returns([Object.create(nonVisibleIdentityProvider)]),
        });
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const hasVisibleIdentityProviders = oidcIdentityProvidersService.hasVisibleIdentityProviders;

        // then
        assert.false(hasVisibleIdentityProviders);
      });
    });
  });

  module('findByCode', function () {
    module('when the requested identity provider is available', function () {
      test('returns the identity provider', async function (assert) {
        // given
        storeStub = Service.create({
          findAll: sinon.stub().resolves([Object.create(oidcPartner)]),
          peekAll: sinon.stub().returns([Object.create(oidcPartner)]),
        });
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const identityProvider = await oidcIdentityProvidersService.findByCode(oidcPartner.code);

        // then
        assert.strictEqual(identityProvider.code, oidcPartner.code);
      });
    });

    module('when the requested identity provider is not available', function () {
      test('returns undefined', async function (assert) {
        // given
        storeStub = Service.create({
          findAll: sinon.stub().resolves([Object.create(oidcPartner)]),
          peekAll: sinon.stub().returns([Object.create(oidcPartner)]),
        });
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const identityProvider = await oidcIdentityProvidersService.findByCode('not-existing-code');

        // then
        assert.strictEqual(identityProvider, undefined);
      });
    });
  });

  module('findBySlug', function () {
    module('when the requested identity provider is available', function () {
      test('returns the identity provider', async function (assert) {
        // given
        storeStub = Service.create({
          findAll: sinon.stub().resolves([Object.create(oidcPartner)]),
          peekAll: sinon.stub().returns([Object.create(oidcPartner)]),
        });
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const identityProvider = await oidcIdentityProvidersService.findBySlug(oidcPartner.slug);

        // then
        assert.strictEqual(identityProvider.code, oidcPartner.code);
      });
    });

    module('when the requested identity provider is not available', function () {
      test('returns undefined', async function (assert) {
        // given
        storeStub = Service.create({
          findAll: sinon.stub().resolves([Object.create(oidcPartner)]),
          peekAll: sinon.stub().returns([Object.create(oidcPartner)]),
        });
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const identityProvider = await oidcIdentityProvidersService.findBySlug('not-existing-slug');

        // then
        assert.strictEqual(identityProvider, undefined);
      });
    });
  });

  module('getIdentityProviderNamesByAuthenticationMethods', function () {
    test('should return identity provider names for methods', function (assert) {
      // given
      const oidcPartner2 = Object.create({
        id: 'france-connect',
        code: 'FRANCE_CONNECT',
        organizationName: 'France Connect',
        shouldCloseSession: false,
        source: 'france-connect',
      });
      const oidcPartner3 = Object.create({
        id: 'impots-gouv',
        code: 'IMPOTS_GOUV',
        organizationName: 'Impots.gouv',
        shouldCloseSession: false,
        source: 'impots-gouv',
      });
      storeStub = Service.create({
        findAll: sinon.stub().resolves([oidcPartner2, oidcPartner3]),
        peekAll: sinon.stub().returns([oidcPartner2, oidcPartner3]),
      });
      oidcIdentityProvidersService.set('store', storeStub);

      const methods = [{ identityProvider: 'FRANCE_CONNECT' }, { identityProvider: 'IMPOTS_GOUV' }];

      // when
      const names = oidcIdentityProvidersService.getIdentityProviderNamesByAuthenticationMethods(methods);

      // expect
      assert.deepEqual(names, ['France Connect', 'Impots.gouv']);
    });
  });

  module('featuredIdentityProvider', function () {
    module('when there is some identity providers containing a visible featured one', function () {
      test('returns the featured identity provider', async function () {
        // given
        const currentDomainService = this.owner.lookup('service:currentDomain');
        sinon.stub(currentDomainService, 'isFranceDomain').value(false);

        const oidcFwb = {
          id: 'fwb',
          code: 'FWB',
          organizationName: 'FWB',
          slug: 'fwb',
          shouldCloseSession: false,
          source: 'fwb',
          isVisible: true,
        };
        storeStub = Service.create({
          findAll: sinon.stub().resolves([Object.create(oidcFwb)]),
          peekAll: sinon.stub().returns([Object.create(oidcFwb)]),
        });
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const featuredIdentityProvider = await oidcIdentityProvidersService.featuredIdentityProvider;

        // then
        assert.strictEqual(featuredIdentityProvider.id, oidcFwb.id);
        assert.strictEqual(featuredIdentityProvider.code, oidcFwb.code);
        assert.strictEqual(featuredIdentityProvider.organizationName, oidcFwb.organizationName);
        assert.strictEqual(featuredIdentityProvider.slug, oidcFwb.slug);
        assert.strictEqual(featuredIdentityProvider.shouldCloseSession, oidcFwb.shouldCloseSession);
        assert.strictEqual(featuredIdentityProvider.source, oidcFwb.source);
      });
    });

    module('when there is some identity providers but no visible featured one', function () {
      test('returns undefined', async function () {
        // given
        storeStub = Service.create({
          findAll: sinon.stub().resolves([Object.create(oidcPartner)]),
          peekAll: sinon.stub().returns([Object.create(oidcPartner)]),
        });
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const featuredIdentityProvider = await oidcIdentityProvidersService.featuredIdentityProvider;

        // then
        assert.strictEqual(featuredIdentityProvider, undefined);
      });
    });

    module('when there isn’t any identity provider', function () {
      test('returns undefined', async function () {
        // given
        const storeStub = Service.create({
          findAll: sinon.stub().resolves([]),
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
    module('when there is some other visible identity providers', function () {
      test('returns true', async function () {
        // given
        storeStub = Service.create({
          findAll: sinon.stub().resolves([Object.create(oidcPartner)]),
          peekAll: sinon.stub().returns([Object.create(oidcPartner)]),
        });
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        const hasOtherIdentityProviders = await oidcIdentityProvidersService.hasOtherIdentityProviders;

        // then
        assert.strictEqual(hasOtherIdentityProviders, true);
      });
    });

    module('when there isn’t any other visible identity providers', function () {
      test('returns false', async function () {
        // given
        const storeStub = Service.create({
          findAll: sinon.stub().resolves([]),
          peekAll: sinon.stub().returns([]),
        });
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
      // when
      const shouldDisplayAccountRecoveryBanner =
        await oidcIdentityProvidersService.shouldDisplayAccountRecoveryBanner('FER');

      // then
      assert.true(shouldDisplayAccountRecoveryBanner);
    });
  });
});
