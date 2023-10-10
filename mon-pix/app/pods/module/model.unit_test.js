import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Module', function (hooks) {
  setupTest(hooks);

  test('Module model should exist with the right properties', function (assert) {
    const title = 'Les adresses mail';
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('module', { title });
    assert.ok(model);
    assert.strictEqual(model.title, title);
  });
});
