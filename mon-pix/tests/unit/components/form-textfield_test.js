import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | form-textfield', function() {

  setupTest();

  let component;
  beforeEach(function() {
    component = createGlimmerComponent('component:form-textfield');
  });

  describe('#textfieldType', function() {
    [
      { type: 'text', inputId: 'shi' },
      { type: 'text', inputId: '' },
      { type: 'email', inputId: 'email' },
      { type: 'password', inputId: 'password' },
    ].forEach((data) => {
      it(`should return ${data.type} when input id is ${data.inputId}`, function() {
        // given
        component.args.textfieldName = data.inputId;
        // when
        const inputType = component.textfieldType;
        // then
        expect(inputType).to.equal(data.type);
      });
    });
  });

  describe('#validationStatus', function() {
    it('should return default values when validationStatus is "default"', function() {
      // When
      component.args.validationStatus = 'default';

      // Then
      expect(component.hasIcon).to.equal(false);
      expect(component.iconType).to.equal('');
      expect(component.inputValidationStatus).to.equal('form-textfield__input--default');
      expect(component.inputContainerStatusClass).to.equal('form-textfield__input-container--default');
      expect(component.validationMessageClass).to.equal('form-textfield__message--default');
    });

    it('should return error values when validationStatus is "error"', function() {
      // When
      component.args.validationStatus = 'error';

      // Then
      expect(component.hasIcon).to.equal(true);
      expect(component.iconType).to.equal('error');
      expect(component.inputValidationStatus).to.equal('form-textfield__input--error');
      expect(component.inputContainerStatusClass).to.equal('form-textfield__input-container--error');
      expect(component.validationMessageClass).to.equal('form-textfield__message--error');
    });

    it('should return success values when validationStatus is "success"', function() {
      // When
      component.args.validationStatus = 'success';

      // Then
      expect(component.hasIcon).to.equal(true);
      expect(component.iconType).to.equal('success');
      expect(component.inputValidationStatus).to.equal('form-textfield__input--success');
      expect(component.inputContainerStatusClass).to.equal('form-textfield__input-container--success');
      expect(component.validationMessageClass).to.equal('form-textfield__message--success');
    });
  });
});
