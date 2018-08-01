import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | user', function(hooks) {

  setupTest(hooks);

  test('it exists', function(assert) {
    // given
    let store = this.owner.lookup('service:store');

    // when
    let model = run(() => store.createRecord('user', {}));

    // then
    assert.ok(model);
  });

});
