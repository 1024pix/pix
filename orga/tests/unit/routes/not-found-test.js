import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | not-found', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:not-found');
    assert.ok(route);
  });

  test('should redirect to application route', function(assert) {
    let route = this.owner.lookup('route:not-found');
    let expectedRedirection = 'application';

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
