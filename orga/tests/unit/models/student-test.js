import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | student', function(hooks) {

  setupTest(hooks);

  test('it exists', function(assert) {
    // given
    const store = this.owner.lookup('service:store');

    // when
    const model = run(() => store.createRecord('student', {}));

    // then
    assert.ok(model);
  });

});
