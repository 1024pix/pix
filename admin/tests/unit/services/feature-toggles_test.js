import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';
import Object from '@ember/object';
import Service from '@ember/service';

module('Unit | Service | feature toggles', function (hooks) {
  setupTest(hooks);

  module('feature toggles are loaded', function () {
    test('should load the feature toggles', async function (assert) {
      // Given
      const featureToggles = Object.create({
        aFakeFeatureToggle: false,
      });
      const storeStub = Service.create({
        queryRecord: () => resolve(featureToggles),
      });
      const featureToggleService = this.owner.lookup('service:featureToggles');
      featureToggleService.set('store', storeStub);

      // When
      await featureToggleService.load();

      // Then
      assert.false(featureToggleService.featureToggles.aFakeFeatureToggle);
    });
  });
});
