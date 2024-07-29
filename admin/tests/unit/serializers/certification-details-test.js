import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Serializer | certification details', function (hooks) {
  setupTest(hooks);

  test('it serializes records', function (assert) {
    class FeatureTogglesMock extends Service {
      featureToggles = {};
    }

    this.owner.register('service:feature-toggles', FeatureTogglesMock);

    const store = this.owner.lookup('service:store');
    const record = store.createRecord('certification-details', {});

    const serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });
});
