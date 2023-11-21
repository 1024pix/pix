import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | OidcIdentityProvider', function (hooks) {
  setupTest(hooks);
  module('#urlForFindAll', function () {
    test('returns correct url for ready providers including audience parameter', function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:oidc-identity-provider');

      // when
      const url = adapter.urlForFindAll(null, {
        adapterOptions: {
          readyIdentityProviders: true,
        },
      });

      // then
      assert.ok(url.endsWith('/oidc/identity-providers?audience=admin'));
    });

    test('returns correct url for all available providers', function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:oidc-identity-provider');

      // when
      const url = adapter.urlForFindAll(null, {
        adapterOptions: {},
      });

      // then
      assert.ok(url.endsWith('/admin/oidc/identity-providers'));
    });
  });
});
