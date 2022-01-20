import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | not-found', function (hooks) {
  setupTest(hooks);

  test('should redirect to application route', function (assert) {
    assert.expect(1);
    const route = this.owner.lookup('route:not-found');
    const expectedRedirection = 'application';

    route.transitionTo = (redirection) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(redirection, expectedRedirection, `expect transition to ${expectedRedirection}, got ${redirection}`);
    };

    route.afterModel();
  });
});
