import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | form-textfield', function (hooks) {
  setupTest(hooks);

  let component;
  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:form-textfield');
  });

  module('#textfieldType', function () {
    [
      { type: 'text', inputId: 'shi' },
      { type: 'text', inputId: '' },
      { type: 'email', inputId: 'email' },
      { type: 'password', inputId: 'password' },
    ].forEach((data) => {
      test(`should return ${data.type} when input id is ${data.inputId}`, function (assert) {
        // given
        component.args.textfieldName = data.inputId;
        // when
        const inputType = component.textfieldType;
        // then
        assert.equal(inputType, data.type);
      });
    });
  });

  module('#validationStatus', function () {
    test('should return default values when validationStatus is "default"', function (assert) {
      // When
      component.args.validationStatus = 'default';

      // Then
      assert.equal(component.hasIcon, false);
      assert.equal(component.iconType, '');
      assert.equal(component.inputValidationStatus, 'form-textfield__input--default');
      assert.equal(component.inputContainerStatusClass, 'form-textfield__input-container--default');
      assert.equal(component.validationMessageClass, 'form-textfield__message--default');
    });

    test('should return error values when validationStatus is "error"', function (assert) {
      // When
      component.args.validationStatus = 'error';

      // Then
      assert.equal(component.hasIcon, true);
      assert.equal(component.iconType, 'error');
      assert.equal(component.inputValidationStatus, 'form-textfield__input--error');
      assert.equal(component.inputContainerStatusClass, 'form-textfield__input-container--error');
      assert.equal(component.validationMessageClass, 'form-textfield__message--error');
    });

    test('should return success values when validationStatus is "success"', function (assert) {
      // When
      component.args.validationStatus = 'success';

      // Then
      assert.equal(component.hasIcon, true);
      assert.equal(component.iconType, 'success');
      assert.equal(component.inputValidationStatus, 'form-textfield__input--success');
      assert.equal(component.inputContainerStatusClass, 'form-textfield__input-container--success');
      assert.equal(component.validationMessageClass, 'form-textfield__message--success');
    });
  });
});
