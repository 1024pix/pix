import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | feature-toggles', function (hooks) {
  setupTest(hooks);

  module('featureToggles', function () {
    test('it should initialize the feature toggle isTextToSpeechButtonEnabled to false', async function (assert) {
      // given
      const featureToggleService = this.owner.lookup('service:featureToggles');

      // when
      const featureToggles = await featureToggleService.featureToggles;

      // then
      assert.deepEqual(featureToggles, {});
    });
  });
});
