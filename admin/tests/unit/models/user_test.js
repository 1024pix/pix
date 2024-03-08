import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | user', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('#fullName', function () {
    test('it should return the fullname, combination of last and first name', function (assert) {
      // given
      const user = store.createRecord('user', { firstName: 'Jean-Baptiste', lastName: 'Poquelin' });

      // when
      const fullName = user.fullName;

      // then
      assert.strictEqual(fullName, 'Jean-Baptiste Poquelin');
    });
  });
});
