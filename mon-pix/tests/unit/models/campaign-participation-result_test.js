import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | campaign-participation-result', function (hooks) {
  setupTest(hooks);

  let store, model;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    model = store.createRecord('campaign-participation-result');
  });

  test('exists', function (assert) {
    assert.ok(model);
  });

  module('cleaBadge', () => {
    test('should be undefined if no badge CLEA', function (assert) {
      assert.strictEqual(model.cleaBadge, undefined);
    });
  });

  module('hasReachedStage', () => {
    test('should be false if no reached stage', function (assert) {
      assert.false(model.hasReachedStage);
    });

    test('should be true if has a reached stage', function (assert) {
      model.reachedStage = store.createRecord('reached-stage');
      assert.true(model.hasReachedStage);
    });
  });
});
