import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import Service from '@ember/service';

module('Unit | Serializer | certification details', function(hooks) {
  setupTest(hooks);

  test('it serializes records', function(assert) {
    class FeatureTogglesMock extends Service {
      featureToggles = {};
    }

    this.owner.register('service:feature-toggles', FeatureTogglesMock);

    const store = this.owner.lookup('service:store');
    const record = run(() => store.createRecord('certification-details', {}));

    const serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
