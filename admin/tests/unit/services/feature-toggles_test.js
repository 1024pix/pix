import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { resolve } from 'rsvp';

module('Unit | Service | feature toggles', function (hooks) {
  setupTest(hooks);

  module('feature toggles are loaded', function () {
    test('should load the feature toggles', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const featureToggles = store.createRecord('feature-toggle', {
        isTargetProfileVersioningEnabled: false,
      });
      const storeStub = Service.create({
        queryRecord: () => resolve(featureToggles),
      });
      const featureToggleService = this.owner.lookup('service:featureToggles');
      featureToggleService.set('store', storeStub);

      // When
      await featureToggleService.load();

      // Then
      assert.deepEqual(featureToggleService.featureToggles, featureToggles);
    });
  });
});
