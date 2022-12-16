import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | <%= dasherizedModuleName %>', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('exists', function(assert) {
    const adapter = this.owner.lookup('adapter:<%= classifiedModuleName %>');
    assert.ok(adapter);
  });
});
