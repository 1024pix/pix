import { run } from '@ember/runloop';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | user', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    // when
    const model = run(() => store.createRecord('user', {}));

    // then
    assert.ok(model);
  });
});
