import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | import', (hooks) => {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:import');
  });
  module('get#displayImportMessagePanel', () => {
    test('should return false if there is no error nor warning', (assert) => {
      //when
      component.args.organizationImportDetail = {
        hasWarning: false,
        hasError: false,
      };

      // then
      assert.false(component.displayImportMessagePanel);
    });
    test('should return true if there is errors but no warning', (assert) => {
      //when
      component.args.organizationImportDetail = {
        hasWarning: false,
        hasError: true,
      };

      // then
      assert.true(component.displayImportMessagePanel);
    });
    test('should return true if there is warnings but no error', (assert) => {
      //when
      component.args.organizationImportDetail = {
        hasWarning: true,
        hasError: false,
      };

      // then
      assert.true(component.displayImportMessagePanel);
    });
    test('should return true if there is warnings and errors', (assert) => {
      //when
      component.args.organizationImportDetail = {
        hasWarning: true,
        hasError: true,
      };

      // then
      assert.true(component.displayImportMessagePanel);
    });
  });

  module('get#panelClasses', () => {
    test('should return the panel class when there is no warnings', (assert) => {
      // when
      component.args.organizationImportDetail = { hasWarning: false };
      // then
      assert.strictEqual(component.panelClasses, 'import-students-page__error-panel');
    });
    test('should return the panel class when there is warnings', (assert) => {
      // when
      component.args.organizationImportDetail = { hasWarning: true };
      // then
      assert.strictEqual(
        component.panelClasses,
        'import-students-page__error-panel import-students-page__error-panel--warning',
      );
    });
  });

  module('get#errorDetailList', (hooks) => {
    const errorSymbol = Symbol('error');

    hooks.beforeEach(() => {
      component.intl = { t: sinon.stub().callsFake((key) => key) };
      component.errorMessages = { getErrorMessage: sinon.stub().returns(errorSymbol) };
    });

    test('should return errors when has errors', function (assert) {
      const error = { code: 'error', meta: { line: 1 } };

      //when
      component.args.organizationImportDetail = {
        errors: [error],
        status: 'ERROR',
      };
      const errors = component.errorDetailList;
      // then

      assert.deepEqual(errors, [errorSymbol]);
      assert.ok(component.errorMessages.getErrorMessage.calledWithExactly(error.code, error.meta));
    });

    test('should return warnings when has warnings', async function (assert) {
      //when
      const warnings = [
        { code: 'warning', field: 'diploma', value: 'bac', studentNumber: '123' },
        { code: 'warning', field: 'study-scheme', value: 'licence', studentNumber: '123' },
      ];

      component.args.organizationImportDetail = {
        errors: warnings,
        hasWarning: true,
      };

      const errors = component.errorDetailList;
      // then

      assert.deepEqual(errors, [
        'pages.organization-participants-import.warnings.diploma',
        'pages.organization-participants-import.warnings.study-scheme',
      ]);
      assert.ok(component.errorMessages.getErrorMessage.notCalled);
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
