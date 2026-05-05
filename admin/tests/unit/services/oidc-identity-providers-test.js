import Object from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | oidc-identity-providers', function (hooks) {
  setupTest(hooks);
  let oidcIdentityProvidersService, oidcPartner;
  let storeStub;

  hooks.beforeEach(function () {
    // given
    oidcPartner = {
      id: 'OIDC_PARTNER',
      code: 'OIDC_PARTNER',
      organizationName: 'Partenaire OIDC',
      shouldCloseSession: false,
      source: 'oidc-externe',
    };
    const oidcPartnerObject = Object.create(oidcPartner);
    storeStub = Service.create({
      findAll: sinon.stub().resolves([oidcPartnerObject]),
      peekAll: sinon.stub().returns([oidcPartnerObject]),
    });
    oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
    oidcIdentityProvidersService.set('store', storeStub);
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

  module('loadAllAvailableIdentityProviders', function () {
    test('should contain identity providers by id and retrieve the whole list', async function (assert) {
      // when
      await oidcIdentityProvidersService.loadAllAvailableIdentityProviders();

      // then
      assert.ok(storeStub.findAll.calledWith('oidc-identity-provider'));
      assert.strictEqual(oidcIdentityProvidersService.list[0].code, oidcPartner.code);
      assert.strictEqual(oidcIdentityProvidersService.list[0].organizationName, oidcPartner.organizationName);
      assert.strictEqual(oidcIdentityProvidersService.list[0].shouldCloseSession, oidcPartner.shouldCloseSession);
      assert.strictEqual(oidcIdentityProvidersService.list[0].source, oidcPartner.source);
    });
  });

  module('loadReadyIdentityProviders', function () {
    test('should contain identity providers by id and retrieve the whole list', async function (assert) {
      // when
      await oidcIdentityProvidersService.loadReadyIdentityProviders();

      // then
      assert.ok(
        storeStub.findAll.calledWith('oidc-identity-provider', {
          adapterOptions: { readyIdentityProviders: true },
        }),
      );
      assert.strictEqual(oidcIdentityProvidersService.list[0].code, oidcPartner.code);
      assert.strictEqual(oidcIdentityProvidersService.list[0].organizationName, oidcPartner.organizationName);
      assert.strictEqual(oidcIdentityProvidersService.list[0].shouldCloseSession, oidcPartner.shouldCloseSession);
      assert.strictEqual(oidcIdentityProvidersService.list[0].source, oidcPartner.source);
    });
  });
});
