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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(inputType, data.type);
      });
    });
  });

  module('#validationStatus', function () {
    test('should return default values when validationStatus is "default"', function (assert) {
      // When
      component.args.validationStatus = 'default';

      // Then
      assert.false(component.hasIcon);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.iconType, '');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.inputValidationStatus, 'form-textfield__input--default');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.inputContainerStatusClass, 'form-textfield__input-container--default');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.validationMessageClass, 'form-textfield__message--default');
    });

    test('should return error values when validationStatus is "error"', function (assert) {
      // When
      component.args.validationStatus = 'error';

      // Then
      assert.true(component.hasIcon);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.iconType, 'error');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.inputValidationStatus, 'form-textfield__input--error');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.inputContainerStatusClass, 'form-textfield__input-container--error');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.validationMessageClass, 'form-textfield__message--error');
    });

    test('should return success values when validationStatus is "success"', function (assert) {
      // When
      component.args.validationStatus = 'success';

      // Then
      assert.true(component.hasIcon);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.iconType, 'success');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.inputValidationStatus, 'form-textfield__input--success');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.inputContainerStatusClass, 'form-textfield__input-container--success');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.validationMessageClass, 'form-textfield__message--success');
    });
  });
});
