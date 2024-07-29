import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | organization-place-statistic', function (hooks) {
  setupTest(hooks);

  module('hasAnonymousSeat', function () {
    test('return true when anonymousSeat greater than 0', function (assert) {
      const store = this.owner.lookup('service:store');

      const model = store.createRecord('organization-place-statistic', {
        anonymousSeat: 1,
      });

      assert.true(model.hasAnonymousSeat);
    });

    test('return false when anonymousSeat equal to 0', function (assert) {
      const store = this.owner.lookup('service:store');

      const model = store.createRecord('organization-place-statistic', {
        anonymousSeat: 0,
      });

      assert.false(model.hasAnonymousSeat);
    });
  });
});
