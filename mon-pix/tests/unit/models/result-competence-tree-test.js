import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | result competence tree', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('exists', function (assert) {
    const model = store.createRecord('result-competence-tree');
    assert.ok(model);
  });
});
