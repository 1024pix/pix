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
        assert.strictEqual(inputType, data.type);
      });
    });
  });

  module('#validationStatus', function () {
    test('should return default values when validationStatus is "default"', function (assert) {
      // When
      component.args.validationStatus = 'default';

      // Then
      assert.false(component.hasIcon);
      assert.strictEqual(component.iconType, '');
      assert.strictEqual(component.inputValidationStatus, 'form-textfield__input--default');
      assert.strictEqual(component.inputContainerStatusClass, 'form-textfield__input-container--default');
      assert.strictEqual(component.validationMessageClass, 'form-textfield__message--default');
    });

    test('should return error values when validationStatus is "error"', function (assert) {
      // When
      component.args.validationStatus = 'error';

      // Then
      assert.true(component.hasIcon);
      assert.strictEqual(component.iconType, 'error');
      assert.strictEqual(component.inputValidationStatus, 'form-textfield__input--error');
      assert.strictEqual(component.inputContainerStatusClass, 'form-textfield__input-container--error');
      assert.strictEqual(component.validationMessageClass, 'form-textfield__message--error');
    });

    test('should return success values when validationStatus is "success"', function (assert) {
      // When
      component.args.validationStatus = 'success';

      // Then
      assert.true(component.hasIcon);
      assert.strictEqual(component.iconType, 'success');
      assert.strictEqual(component.inputValidationStatus, 'form-textfield__input--success');
      assert.strictEqual(component.inputContainerStatusClass, 'form-textfield__input-container--success');
      assert.strictEqual(component.validationMessageClass, 'form-textfield__message--success');
    });
  });
});
