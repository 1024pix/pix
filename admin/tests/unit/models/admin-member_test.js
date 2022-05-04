import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | admin-member', function (hooks) {
  setupTest(hooks);
  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('#fullName', function () {
    test('it should return the fullname, combination of first and last name', function (assert) {
      // given
      const adminMember = run(() => {
        return store.createRecord('adminMember', { firstName: 'Jean-Baptiste', lastName: 'Poquelin' });
      });

      // when
      const fullName = adminMember.fullName;

      // then
      assert.strictEqual(fullName, 'Jean-Baptiste Poquelin');
    });
  });
});
