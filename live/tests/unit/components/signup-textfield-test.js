import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

const EMPTY_FIRSTNAME_ERROR_MESSAGE = 'Votre prénom n’est pas renseigné.';
const EMPTY_LASTNAME_ERROR_MESSAGE = 'Votre nom n’est pas renseigné.';
const INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE = 'Votre mot de passe doit comporter au moins une lettre, un chiffre et' +
  ' 8 caractères.';

describe('Unit | Component | signupTextfieldComponent', function() {

  setupTest('component:signup-textfield', {});

  describe('Component should renders :', function() {

    [
      { renderingIntent: 'text', inputId: 'shi' },
      { renderingIntent: 'text', inputId: '' },
      { renderingIntent: 'email', inputId: 'email' },
      { renderingIntent: 'password', inputId: 'password' }
    ].forEach(({ renderingIntent, inputId }) => {
      it(`an ${renderingIntent} when input id is ${inputId}`, function() {
        // given
        const component = this.subject();
        // when
        component.set('textfieldName', inputId);
        const inputType = component.get('textfieldType');
        // then
        expect(inputType).to.equal(renderingIntent);
      });
    });

  });

  describe('When validationStatus gets "default", Component computed property: ', function() {

    [
      { property: 'hasIcon', expectedValue: false },
      { property: 'iconType', expectedValue: '' },
      { property: 'inputValidationStatus', expectedValue: 'signup-textfield__input--default' },
      { property: 'inputContainerStatusClass', expectedValue: 'signup-textfield__input-container--default' },
      { property: 'validationMessageClass', expectedValue: 'signup-textfield__message--default' },
    ].forEach(({ property, expectedValue }) => {
      it(`${property} should return ${expectedValue} `, function() {
        // Given
        const component = this.subject();
        // When
        component.set('validationStatus', 'default');
        component.set('validationMessage', '');
        const propertyValue = component.get(property);
        // Then
        expect(propertyValue).to.equal(expectedValue);
      });
    });

    describe('#validationMessage: ', function() {

      [

        { errorType: 'firstname is empty', message: '' },
        { errorType: 'lastname is empty', message: '' },
        { errorType: 'password is incorrect', message: '' },

      ].forEach(({ errorType, message }) => {

        it(`gets ${message} when ${errorType}`, function() {
          // Given
          const component = this.subject();
          // When
          component.set('validationStatus', 'default');
          component.set('validationMessage', message);
          const propertyValue = component.get('validationMessage');
          // Then
          expect(propertyValue).to.equal(message);
        });

      });

    });

  });

  describe('When validationStatus gets "error", Component computed property: ', function() {

    [
      { property: 'hasIcon', expectedValue: true },
      { property: 'iconType', expectedValue: 'error' },
      { property: 'inputValidationStatus', expectedValue: 'signup-textfield__input--error' },
      { property: 'inputContainerStatusClass', expectedValue: 'signup-textfield__input-container--error' },
      { property: 'validationMessageClass', expectedValue: 'signup-textfield__message--error' },
    ].forEach(({ property, expectedValue }) => {
      it(`${property} should return ${expectedValue} `, function() {
        // Given
        const component = this.subject();
        // When
        component.set('validationStatus', 'error');
        const propertyValue = component.get(property);
        // Then
        expect(propertyValue).to.equal(expectedValue);
      });
    });

    describe('#validationMessage: ', function() {

      [

        { errorType: 'firstname is empty', message: EMPTY_FIRSTNAME_ERROR_MESSAGE },
        { errorType: 'lastname is empty', message: EMPTY_LASTNAME_ERROR_MESSAGE },
        { errorType: 'password is incorrect', message: INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE },

      ].forEach(({ errorType, message }) => {

        it(`gets ${message} when ${errorType}`, function() {
          // Given
          const component = this.subject();
          // When
          component.set('validationStatus', 'error');
          component.set('validationMessage', message);
          const propertyValue = component.get('validationMessage');
          // Then
          expect(propertyValue).to.equal(message);
        });

      });

    });

  });

  describe('When validationStatus gets "success", Component computed property: ', function() {

    [
      { property: 'hasIcon', expectedValue: true },
      { property: 'iconType', expectedValue: 'success' },
      { property: 'inputValidationStatus', expectedValue: 'signup-textfield__input--success' },
      { property: 'inputContainerStatusClass', expectedValue: 'signup-textfield__input-container--success' },
      { property: 'validationMessageClass', expectedValue: 'signup-textfield__message--success' },
    ].forEach(({ property, expectedValue }) => {
      it(`${property} should return ${expectedValue} `, function() {
        // Given
        const component = this.subject();
        // When
        component.set('validationStatus', 'success');
        const propertyValue = component.get(property);
        // Then
        expect(propertyValue).to.equal(expectedValue);
      });
    });

    describe('#validationMessage: ', function() {

      [

        { errorType: 'firstname is valid', message: EMPTY_FIRSTNAME_ERROR_MESSAGE },
        { errorType: 'lastname is valid', message: EMPTY_LASTNAME_ERROR_MESSAGE },
        { errorType: 'password is valid', message: INCORRECT_PASSWORD_FORMAT_ERROR_MESSAGE },

      ].forEach(({ errorType, message }) => {

        it(`gets ${message} when ${errorType}`, function() {
          // Given
          const component = this.subject();
          // When
          component.set('validationStatus', 'error');
          component.set('validationMessage', message);
          const propertyValue = component.get('validationMessage');
          // Then
          expect(propertyValue).to.equal(message);
        });

      });

    });

  });

});
