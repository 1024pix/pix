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
      id: 'oidc-partner',
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

  module('isProviderEnabled', function () {
    test('returns true if given provider is in the list', async function (assert) {
      // when
      const isProviderEnabled = await oidcIdentityProvidersService.isProviderEnabled('oidc-partner');

      // then
      assert.true(isProviderEnabled);
    });

    test('returns false if given provider is in not the list', async function (assert) {
      // when
      const isProviderEnabled = await oidcIdentityProvidersService.isProviderEnabled('disabled-provider');

      // then
      assert.false(isProviderEnabled);
    });
  });
});
