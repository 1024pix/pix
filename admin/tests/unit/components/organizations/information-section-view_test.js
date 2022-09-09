import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import Service from '@ember/service';

module('Unit | Component | organizations/information-section-view', function (hooks) {
  setupTest(hooks);

  module('#identityProviderName', function () {
    test('it should return "GAR" when organization has GAR identityProvider', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const oidcPartner = store.createRecord('oidc-identity-provider', {
        code: 'OIDC',
        organizationName: 'a super orga',
        hasLogoutUrl: false,
        source: 'idp',
      });
      class OidcIdentityProvidersStub extends Service {
        list = [oidcPartner];
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
      const component = createGlimmerComponent('component:organizations/information-section-view', {
        organization: { identityProviderForCampaigns: 'GAR' },
      });

      // when / then
      assert.strictEqual(component.identityProviderName, 'GAR');
    });

    test('it should return the organization SSO name when organization has an oidc identityProvider', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const oidcPartner = store.createRecord('oidc-identity-provider', {
        code: 'OIDC',
        organizationName: 'a super orga',
        hasLogoutUrl: false,
        source: 'idp',
      });
      class OidcIdentityProvidersStub extends Service {
        list = [oidcPartner];
      }
      this.owner.register('service:oidcIdentityProviders', OidcIdentityProvidersStub);
      const component = createGlimmerComponent('component:organizations/information-section-view', {
        organization: { identityProviderForCampaigns: 'OIDC' },
      });

      // when / then
      assert.strictEqual(component.identityProviderName, 'a super orga');
    });
  });
});
