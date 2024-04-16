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

  module('#isSco', function () {
    module('when user has not seen CGU and is not anonymous', function () {
      test('should return true', function (assert) {
        // given
        const user = store.createRecord('user');
        user.cgu = false;
        user.isAnonymous = false;

        // then
        assert.true(user.isSco);
      });
    });

    module('when user has seen CGU or is anonymous', function () {
      test('should return false', function (assert) {
        // given
        const user = store.createRecord('user');
        user.cgu = true;
        user.isAnonymous = true;

        // then
        assert.false(user.isSco);
      });
    });
  });
});
