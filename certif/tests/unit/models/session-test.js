import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | session', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('session', {}));
    assert.ok(model);
  });

  test('it should return the right data in the session model', function(assert) {
    const store = this.owner.lookup('service:store');
    const model = run(() => store.createRecord('session', {
      id: 123,
    }));
    assert.equal(model.id, 123);
  });
});
