import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | terms-of-service-oidc', function (hooks) {
  setupTest(hooks);

  test('exists', function (assert) {
    const route = this.owner.lookup('route:TermsOfServiceOidc');
    assert.ok(route);
  });
});
