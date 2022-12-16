import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

import Object from '@ember/object';
import Service from '@ember/service';

module('Unit | Service | feature-toggles', function (hooks) {
  setupTest(hooks);

  module('feature toggles are loaded', function (hooks) {
    const featureToggles = Object.create({});

    let storeStub;

    hooks.beforeEach(function () {
      storeStub = Service.create({
        queryRecord: sinon.stub().resolves(featureToggles),
      });
    });

    test('should load the feature toggles', async function (assert) {
      // given
      const featureToggleService = this.owner.lookup('service:featureToggles');
      featureToggleService.set('store', storeStub);

      // when
      await featureToggleService.load();

      // then
      assert.deepEqual(featureToggleService.featureToggles, featureToggles);
    });
  });
});
