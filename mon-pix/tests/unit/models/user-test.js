import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | user model', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('exists', function (assert) {
    const model = store.createRecord('user');
    assert.ok(model);
  });

  module('#fullName', function () {
    test('should concatenate user first and last name', function (assert) {
      // given
      const model = store.createRecord('user');
      model.firstName = 'Manu';
      model.lastName = 'Phillip';

      // when
      const fullName = model.fullName;

      // then
      assert.strictEqual(fullName, 'Manu Phillip');
    });
  });
});
