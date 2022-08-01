import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | index', function (hooks) {
  setupTest(hooks);

  module('model', function () {
    test('should redirect to /accueil', async function (assert) {
      // Given
      const route = this.owner.lookup('route:index');
      route.router = { replaceWith: sinon.spy() };

      // When
      await route.redirect();

      // Then
      assert.expect(0);
      sinon.assert.calledWith(route.router.replaceWith, 'user-dashboard');
    });
  });
});
