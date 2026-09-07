import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | certification-version', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('#get hasExternalCalibrationId', function () {
    test('returns true when externalCalibrationId is set', function (assert) {
      const version = store.createRecord('certification-version', { externalCalibrationId: 42 });
      assert.true(version.hasExternalCalibrationId);
    });

    test('returns false when externalCalibrationId is null', function (assert) {
      const version = store.createRecord('certification-version', { externalCalibrationId: null });
      assert.false(version.hasExternalCalibrationId);
    });
  });
});
