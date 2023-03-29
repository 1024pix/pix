import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | form-textfield-date', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:form-textfield-date');
  });

  module('When validationStatus gets "default", Component computed property: ', function () {
    [{ field: 'day' }, { field: 'month' }, { field: 'year' }].forEach(({ field }) => {
      [
        { property: `${field}HasIcon`, expectedValue: false },
        { property: `${field}InputValidationStatus`, expectedValue: 'form-textfield__input--default' },
        { property: `${field}InputContainerStatusClass`, expectedValue: 'form-textfield__input-container--default' },
        { property: `${field}ValidationMessageClass`, expectedValue: 'form-textfield__message--default' },
      ].forEach(({ property, expectedValue }) => {
        test(`${property} should return ${expectedValue}`, function (assert) {
          // When
          component.args[`${field}ValidationStatus`] = 'default';
          component.args[`${field}ValidationMessage`] = '';
          const propertyValue = component[property];

          // Then
          assert.strictEqual(propertyValue, expectedValue);
        });
      });
    });
  });

  module('When validationStatus gets "error", Component computed property: ', function () {
    [{ field: 'day' }, { field: 'month' }, { field: 'year' }].forEach(({ field }) => {
      [
        { property: `${field}HasIcon`, expectedValue: true },
        { property: `${field}InputValidationStatus`, expectedValue: 'form-textfield__input--error' },
        { property: `${field}InputContainerStatusClass`, expectedValue: 'form-textfield__input-container--error' },
        { property: `${field}ValidationMessageClass`, expectedValue: 'form-textfield__message--error' },
      ].forEach(({ property, expectedValue }) => {
        test(`${property} should return ${expectedValue}`, function (assert) {
          // When
          component.args[`${field}ValidationStatus`] = 'error';
          component.args[`${field}ValidationMessage`] = 'error message';
          const propertyValue = component[property];

          // Then
          assert.strictEqual(propertyValue, expectedValue);
        });
      });
    });
  });

  module('When validationStatus gets "success", Component computed property: ', function () {
    [{ field: 'day' }, { field: 'month' }, { field: 'year' }].forEach(({ field }) => {
      [
        { property: `${field}HasIcon`, expectedValue: true },
        { property: `${field}InputValidationStatus`, expectedValue: 'form-textfield__input--success' },
        { property: `${field}InputContainerStatusClass`, expectedValue: 'form-textfield__input-container--success' },
        { property: `${field}ValidationMessageClass`, expectedValue: 'form-textfield__message--success' },
      ].forEach(({ property, expectedValue }) => {
        test(`${property} should return ${expectedValue}`, function (assert) {
          // When
          component.args[`${field}ValidationStatus`] = 'success';
          component.args[`${field}ValidationMessage`] = '';
          const propertyValue = component[property];

          // Then
          assert.strictEqual(propertyValue, expectedValue);
        });
      });
    });
  });
});
