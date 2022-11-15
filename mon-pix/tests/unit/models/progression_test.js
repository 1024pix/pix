import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Progression', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('exists', function (assert) {
    const model = store.createRecord('progression');
    assert.ok(model);
  });

  module('Computed property #completionPercentage', function () {
    test('should compute a completionRate property in %', function (assert) {
      run(() => {
        // given
        const progression = store.createRecord('progression', { completionRate: 0.06815 });

        // when
        const completionPercentage = progression.completionPercentage;

        // then
        assert.equal(completionPercentage, 7);
      });
    });
  });
});
