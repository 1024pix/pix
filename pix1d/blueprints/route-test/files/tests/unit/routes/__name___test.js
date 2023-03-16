import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | <%= dasherizedModuleName %>', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:<%= classifiedModuleName %>');
    assert.ok(route);
  });
});
