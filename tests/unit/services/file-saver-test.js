import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | file-saver', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let service = this.owner.lookup('service:file-saver');
    assert.ok(service);
  });
});

