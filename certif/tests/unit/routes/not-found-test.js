import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | not-found', function(hooks) {
  setupTest(hooks);

  test('should redirect to application route', function(assert) {
    const route = this.owner.lookup('route:not-found');
    const expectedRedirection = 'application';

    route.transitionTo = (redirection) => {
      assert.equal(
        redirection,
        expectedRedirection,
        `expect transition to ${expectedRedirection}, got ${redirection}`
      );
    };

    route.afterModel();
  });
});
