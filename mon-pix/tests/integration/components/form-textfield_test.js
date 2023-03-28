import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click, fillIn, find, render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | form textfield', function (hooks) {
  setupIntlRenderingTest(hooks);

  const LABEL = '.form-textfield__label';
  const LABEL_TEXT = 'NOM';

  const MESSAGE = '.form-textfield__message';
  const MESSAGE_ERROR_STATUS = 'form-textfield__message--error';
  const MESSAGE_SUCCESS_STATUS = 'form-textfield__message--success';
  const MESSAGE_TEXT = 'MESSAGE';

  const INPUT = '.form-textfield__input';
  const INPUT_DEFAULT_CLASS = 'form-textfield__input--default';
  const INPUT_SUCCESS_CLASS = 'form-textfield__input--success';
  const INPUT_ERROR_CLASS = 'form-textfield__input--error';

  module('#Component rendering', function (hooks) {
    hooks.beforeEach(async function () {
      this.set('label', 'nom');
      this.set('validationStatus', '');
      this.set('validationMessage', MESSAGE_TEXT);
      this.set('textfieldName', 'firstname');

      // When
      await render(
        hbs`<FormTextfield @label={{this.label}} @validationStatus={{this.validationStatus}} @validationMessage={{this.validationMessage}} @textfieldName={{this.textfieldName}}/>`
      );
    });

    [
      { expectedRendering: 'label', item: LABEL, expectedLength: 1 },
      { expectedRendering: 'div', item: MESSAGE, expectedLength: 1 },
      { expectedRendering: 'input', item: INPUT, expectedLength: 1 },
    ].forEach(function ({ expectedRendering, item, expectedLength }) {
      test(`should render a ${expectedRendering}`, function (assert) {
        // Then
        assert.dom(item).exists({ count: expectedLength });
        assert.strictEqual(find(item).nodeName, expectedRendering.toUpperCase());
      });
    });

    [
      { item: LABEL, expectedRendering: 'label', expectedText: LABEL_TEXT },
      { item: MESSAGE, expectedRendering: 'div.message', expectedText: MESSAGE_TEXT },
    ].forEach(function ({ item, expectedRendering, expectedText }) {
      test(`should render a ${expectedRendering}`, function (assert) {
        // Then
        assert.ok(find(item).textContent.toUpperCase().includes(expectedText));
      });
    });
  });

  module('#Component Interactions', function () {
    test('should handle action <validate> when input lost focus', async function (assert) {
      // given
      let isActionValidateHandled = false;
      let inputValueToValidate;
      const expectedInputValue = 'firstname';

      this.set('validate', function (arg) {
        isActionValidateHandled = true;
        inputValueToValidate = arg;
      });

      this.set('label', 'nom');
      this.set('validationStatus', '');
      this.set('validationMessage', 'message');
      this.set('textfieldName', 'firstname');

      await render(
        hbs`<FormTextfield @label={{this.label}} @validationStatus={{this.validationStatus}} @validationMessage={{this.validationMessage}} @textfieldName={{this.textfieldName}} @onValidate={{this.validate}}/>`
      );

      // when
      await fillIn(INPUT, 'pix');
      await triggerEvent(INPUT, 'focusout');

      // then
      assert.true(isActionValidateHandled);
      assert.deepEqual(inputValueToValidate, expectedInputValue);
    });

    module('#When validationStatus gets "default", Component should ', function (hooks) {
      hooks.beforeEach(async function () {
        this.set('label', 'nom');
        this.set('validationStatus', 'default');
        this.set('textfieldName', 'firstname');
        this.set('validationMessage', 'message');

        // When
        await render(
          hbs`<FormTextfield @label={{this.label}} @validationStatus={{this.validationStatus}} @validationMessage={{this.validationMessage}} @textfieldName={{this.textfieldName}}/>`
        );
      });

      test("return true if any svg doesn't exist", function (assert) {
        // then
        assert.dom('img').doesNotExist();
      });

      test(`contain an input with an additional class ${INPUT_DEFAULT_CLASS}`, function (assert) {
        const input = find(INPUT);
        // then
        assert.ok(input.getAttribute('class').includes(INPUT_DEFAULT_CLASS));
        assert.ok(input.value.includes(''));
      });
    });

    module('#When validationStatus gets "error", Component should ', function (hooks) {
      hooks.beforeEach(async function () {
        this.set('label', 'nom');
        this.set('validationStatus', 'error');
        this.set('textfieldName', 'firstname');
        this.set('validationMessage', 'message');

        // When
        await render(
          hbs`<FormTextfield @label={{this.label}} @validationStatus={{this.validationStatus}} @validationMessage={{this.validationMessage}} @textfieldName={{this.textfieldName}}/>`
        );
      });

      test('return true if any img does exist', function (assert) {
        // then
        assert.dom('img').exists({ count: 1 });
        assert.ok(find('img').getAttribute('class').includes('form-textfield-icon__state--error'));
      });

      [
        { item: 'Input', itemSelector: INPUT, expectedClass: INPUT_ERROR_CLASS },
        { item: 'Div for message validation status', itemSelector: MESSAGE, expectedClass: MESSAGE_ERROR_STATUS },
      ].forEach(({ item, itemSelector, expectedClass }) => {
        test(`contain an ${item} with an additional class ${expectedClass}`, function (assert) {
          // then
          assert.ok(find(itemSelector).getAttribute('class').includes(expectedClass));
        });
      });
    });

    module('#When validationStatus gets "success", Component should ', function (hooks) {
      hooks.beforeEach(async function () {
        this.set('label', 'nom');
        this.set('validationStatus', 'success');
        this.set('validationMessage', 'message');
        this.set('textfieldName', 'firstname');

        // When
        await render(
          hbs`<FormTextfield @label={{this.label}} @validationStatus={{this.validationStatus}} @validationMessage={{this.validationMessage}} @textfieldName={{this.textfieldName}}/>`
        );
      });

      test('return true if any img does exist', function (assert) {
        // then
        assert.dom('img').exists({ count: 1 });
        assert.ok(find('img').getAttribute('class').includes('form-textfield-icon__state--success'));
      });

      [
        { item: 'Input', itemSelector: INPUT, expectedClass: INPUT_SUCCESS_CLASS },
        { item: 'Div for message validation status', itemSelector: MESSAGE, expectedClass: MESSAGE_SUCCESS_STATUS },
      ].forEach(({ item, itemSelector, expectedClass }) => {
        test(`contain an ${item} with an additional class ${expectedClass}`, function (assert) {
          // then
          assert.ok(find(itemSelector).getAttribute('class').includes(expectedClass));
        });
      });
    });

    module('#When password is hidden', function (hooks) {
      hooks.beforeEach(async function () {
        this.set('label', 'Mot de passe');
        this.set('validationStatus', 'default');
        this.set('validationMessage', 'message');
        this.set('textfieldName', 'password');

        // given
        await render(
          hbs`<FormTextfield @label={{this.label}} @validationStatus={{this.validationStatus}} @validationMessage={{this.validationMessage}} @textfieldName={{this.textfieldName}} @inputValue={{this.inputValue}}/>`
        );
      });

      test('should change type when user click on eye icon', async function (assert) {
        // when
        await click('.form-textfield-icon__button');

        // then
        assert.strictEqual(find('input').getAttribute('type'), 'text');
      });

      test('should change icon when user click on it', async function (assert) {
        // when
        assert.dom('.fa-eye-slash').exists();
        await click('.form-textfield-icon__button');

        // then
        assert.dom('.fa-eye').exists();
      });

      test('should not change icon when user keeps typing his password', async function (assert) {
        // given
        await fillIn(INPUT, 'test');

        // when
        assert.dom('.fa-eye-slash').exists();
        await click('.form-textfield-icon__button');
        await fillIn(INPUT, 'test');
      });
    });
  });
});
