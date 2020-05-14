import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | user', function(hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
  });

  module('#fullName', function() {

    test('it should return the fullname, combination of last and first name', function(assert) {
      // given
      const user = run(() => {
        return store.createRecord('user', { firstName: 'Jean-Baptiste', lastName: 'Poquelin' });
      });

      // when
      const fullName = user.fullName;

      // then
      assert.equal(fullName, 'Jean-Baptiste Poquelin');
    });
  });
});
