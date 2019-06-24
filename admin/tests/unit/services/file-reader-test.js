import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | file-reader', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    const service = this.owner.lookup('service:file-reader');
    assert.ok(service);
  });
});
