import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | feature-toggles', function (hooks) {
  setupTest(hooks);

  module('featureToggles', function () {
    test('returns properties', async function (assert) {
      // given
      const configService = this.owner.lookup('service:config');
      sinon.stub(configService, 'featureToggles').value({ aProperty: 'some value' });

      const featureToggleService = this.owner.lookup('service:featureToggles');

      // when
      const featureToggles = await featureToggleService.featureToggles;

      // then
      assert.deepEqual(featureToggles, { aProperty: 'some value' });
    });
  });
});
