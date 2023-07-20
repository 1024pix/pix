import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

import Object from '@ember/object';
import Service from '@ember/service';

module('Unit | Service | oidc-identity-providers', function (hooks) {
  setupTest(hooks);

  module('load', function () {
    test('should contain identity providers by id and retrieve the whole list', async function (assert) {
      // given
      const oidcPartner = {
        id: 'oidc-partner',
        code: 'OIDC_PARTNER',
        organizationName: 'Partenaire OIDC',
        hasLogoutUrl: false,
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
      assert.strictEqual(oidcIdentityProvidersService['oidc-partner'].hasLogoutUrl, oidcPartner.hasLogoutUrl);
      assert.strictEqual(oidcIdentityProvidersService['oidc-partner'].source, oidcPartner.source);
      assert.strictEqual(oidcIdentityProvidersService.list[0].code, oidcPartner.code);
      assert.strictEqual(oidcIdentityProvidersService.list[0].organizationName, oidcPartner.organizationName);
      assert.strictEqual(oidcIdentityProvidersService.list[0].hasLogoutUrl, oidcPartner.hasLogoutUrl);
      assert.strictEqual(oidcIdentityProvidersService.list[0].source, oidcPartner.source);
    });
  });
});
