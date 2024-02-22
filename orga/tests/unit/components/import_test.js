import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | import', (hooks) => {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:import');
  });

  module('get#displayBanner', () => {
    test('should return false as default value', function (assert) {
      //when
      component.args.isLoading = false;

      // then
      assert.false(component.displayBanner);
    });

    test('should return true when loading is active', async function (assert) {
      // when
      component.args.isLoading = true;
      // then
      assert.true(component.displayBanner);
    });
  });

  module('get#errorDetailList', () => {
    test('should return errors when has errors', function (assert) {
      //when
      component.args.errors = [Symbol('ERROR')];
      component.args.warnings = null;

      // then
      assert.deepEqual(component.errorDetailList, component.args.errors);
    });

    test('should return warnings when has warnings', async function (assert) {
      // when
      component.args.errors = null;
      component.args.warnings = [Symbol('WARNING')];
      // then
      assert.deepEqual(component.errorDetailList, component.args.warnings);
    });
  });

  module('get#displayErrorImportPanel', () => {
    test('should return false as default value', function (assert) {
      //when
      component.args.errors = null;
      component.args.warnings = null;

      // then
      assert.false(component.displayErrorImportPanel);
    });

    test('should return true when has errors', function (assert) {
      //when
      component.args.errors = [Symbol('ERROR')];
      component.args.warnings = null;

      // then
      assert.true(component.displayErrorImportPanel);
    });

    test('should return true when has warnings', function (assert) {
      //when
      component.args.errors = null;
      component.args.warnings = [Symbol('WARNING')];

      // then
      assert.true(component.displayErrorImportPanel);
    });
  });

  module('get#supportedFormats', () => {
    test('should return .csv when organization isManagingStudent SCO and isAgriculuture to true', function (assert) {
      // when
      component.currentUser = { isSCOManagingStudents: true, isAgriculture: true };
      // then
      assert.deepEqual(component.supportedFormats, ['.csv']);
    });

    test('should return .csv when organization isManagingStudent SUP', function (assert) {
      // when
      component.currentUser = { isSUPManagingStudents: true };
      // then
      assert.deepEqual(component.supportedFormats, ['.csv']);
    });

    test('should return .xml .zip when organization isManagingStudent SCO', function (assert) {
      // when
      component.currentUser = { isSCOManagingStudents: true, isAgriculture: false };
      // then
      assert.deepEqual(component.supportedFormats, ['.xml', '.zip']);
    });
  });
});
