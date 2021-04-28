import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | form-textfield-date', function() {

  setupTest();

  let component;

  beforeEach(() => {
    component = createGlimmerComponent('component:form-textfield-date');
  });

  describe('When validationStatus gets "default", Component computed property: ', function() {
    [
      { field: 'day' },
      { field: 'month' },
      { field: 'year' },
    ].forEach(({ field }) => {

      [
        { property: `${field}HasIcon`, expectedValue: false },
        { property: `${field}InputValidationStatus`, expectedValue: 'form-textfield__input--default' },
        { property: `${field}InputContainerStatusClass`, expectedValue: 'form-textfield__input-container--default' },
        { property: `${field}ValidationMessageClass`, expectedValue: 'form-textfield__message--default' },

      ].forEach(({ property, expectedValue }) => {
        it(`${property} should return ${expectedValue}`, function() {
          // When
          component.args[`${field}ValidationStatus`] = 'default';
          component.args[`${field}ValidationMessage`] = '';
          const propertyValue = component[property];

          // Then
          expect(propertyValue).to.equal(expectedValue);
        });
      });
    });
  });

  describe('When validationStatus gets "error", Component computed property: ', function() {

    [
      { field: 'day' },
      { field: 'month' },
      { field: 'year' },
    ].forEach(({ field }) => {

      [
        { property: `${field}HasIcon`, expectedValue: true },
        { property: `${field}InputValidationStatus`, expectedValue: 'form-textfield__input--error' },
        { property: `${field}InputContainerStatusClass`, expectedValue: 'form-textfield__input-container--error' },
        { property: `${field}ValidationMessageClass`, expectedValue: 'form-textfield__message--error' },

      ].forEach(({ property, expectedValue }) => {
        it(`${property} should return ${expectedValue}`, function() {
          // When
          component.args[`${field}ValidationStatus`] = 'error';
          component.args[`${field}ValidationMessage`] = 'error message';
          const propertyValue = component[property];

          // Then
          expect(propertyValue).to.equal(expectedValue);
        });
      });
    });
  });

  describe('When validationStatus gets "success", Component computed property: ', function() {

    [
      { field: 'day' },
      { field: 'month' },
      { field: 'year' },
    ].forEach(({ field }) => {

      [
        { property: `${field}HasIcon`, expectedValue: true },
        { property: `${field}InputValidationStatus`, expectedValue: 'form-textfield__input--success' },
        { property: `${field}InputContainerStatusClass`, expectedValue: 'form-textfield__input-container--success' },
        { property: `${field}ValidationMessageClass`, expectedValue: 'form-textfield__message--success' },

      ].forEach(({ property, expectedValue }) => {
        it(`${property} should return ${expectedValue}`, function() {
          // When
          component.args[`${field}ValidationStatus`] = 'success';
          component.args[`${field}ValidationMessage`] = '';
          const propertyValue = component[property];

          // Then
          expect(propertyValue).to.equal(expectedValue);
        });
      });
    });
  });
});
