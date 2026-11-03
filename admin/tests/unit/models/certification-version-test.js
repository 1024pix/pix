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

  module('#get hasGlobalScoringConfiguration', function () {
    test('returns true when globalScoringConfiguration has meshes', function (assert) {
      const version = store.createRecord('certification-version', {
        globalScoringConfiguration: [{ bounds: { min: -4, max: 2 }, meshLevel: 0 }],
      });
      assert.true(version.hasGlobalScoringConfiguration);
    });

    test('returns false when globalScoringConfiguration is empty', function (assert) {
      const version = store.createRecord('certification-version', { globalScoringConfiguration: [] });
      assert.false(version.hasGlobalScoringConfiguration);
    });

    test('returns false when globalScoringConfiguration is null', function (assert) {
      const version = store.createRecord('certification-version', { globalScoringConfiguration: null });
      assert.false(version.hasGlobalScoringConfiguration);
    });
  });

  module('#get isDraft', function () {
    test('returns true when status is draft', function (assert) {
      const version = store.createRecord('certification-version', { status: 'draft' });
      assert.true(version.isDraft);
    });

    test('returns false when status is not draft', function (assert) {
      const version = store.createRecord('certification-version', { status: 'active' });
      assert.false(version.isDraft);
    });
  });

  module('#get isActive', function () {
    test('returns true when status is active', function (assert) {
      const version = store.createRecord('certification-version', { status: 'active' });
      assert.true(version.isActive);
    });

    test('returns false when status is not active', function (assert) {
      const version = store.createRecord('certification-version', { status: 'draft' });
      assert.false(version.isActive);
    });
  });

  module('#get isArchived', function () {
    test('returns true when status is archived', function (assert) {
      const version = store.createRecord('certification-version', { status: 'archived' });
      assert.true(version.isArchived);
    });

    test('returns false when status is not archived', function (assert) {
      const version = store.createRecord('certification-version', { status: 'active' });
      assert.false(version.isArchived);
    });
  });

  module('#get isCoreScope', function () {
    test('returns true when scope is CORE', function (assert) {
      const version = store.createRecord('certification-version', { scope: 'CORE' });
      assert.true(version.isCoreScope);
    });

    test('returns false when scope is a Pix+ scope', function (assert) {
      const version = store.createRecord('certification-version', { scope: 'DROIT' });
      assert.false(version.isCoreScope);
    });
  });
});
