import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { fillIn, find, render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | form textfield date', function (hooks) {
  setupIntlRenderingTest(hooks);

  const LABEL = '.form-textfield__label';
  const LABEL_TEXT = 'date';

  const MESSAGE = '.form-textfield__message';
  const MESSAGE_ERROR_STATUS = 'form-textfield__message--error';
  const MESSAGE_SUCCESS_STATUS = 'form-textfield__message--success';

  const INPUT = '.form-textfield__input';
  const INPUT_DEFAULT_CLASS = 'form-textfield__input--default';
  const INPUT_SUCCESS_CLASS = 'form-textfield__input--success';
  const INPUT_ERROR_CLASS = 'form-textfield__input--error';

  module('#Component rendering', function (hooks) {
    hooks.beforeEach(async function () {
      this.set('label', 'date');
      this.set('dayValidationStatus', '');
      this.set('monthValidationStatus', '');
      this.set('yearValidationStatus', '');
      this.set('dayTextfieldName', 'day');
      this.set('monthTextfieldName', 'month');
      this.set('yearTextfieldName', 'year');
      this.set('dayValidationMessage', 'day message');
      this.set('monthValidationMessage', 'month message');
      this.set('yearValidationMessage', 'year message');
      this.set('validateStub', () => {});

      // When
      await render(hbs`<FormTextfieldDate
        @label={{this.label}}
        @dayValidationStatus={{this.dayValidationStatus}}
        @monthValidationStatus={{this.monthValidationStatus}}
        @yearValidationStatus={{this.yearValidationStatus}}
        @dayValidationMessage={{this.dayValidationMessage}}
        @monthValidationMessage={{this.monthValidationMessage}}
        @yearValidationMessage={{this.yearValidationMessage}}
        @dayTextfieldName={{this.dayTextfieldName}}
        @monthTextfieldName={{this.monthTextfieldName}}
        @yearTextfieldName={{this.yearTextfieldName}}
        @onValidateDay={{this.validateStub}}
        @onValidateMonth={{this.validateStub}}
        @onValidateYear={{this.validateStub}}
      />`);
    });

    [
      { expectedRendering: 'label', item: LABEL, expectedLength: 1 },
      { expectedRendering: 'div', item: MESSAGE, expectedLength: 3 },
      { expectedRendering: 'input', item: INPUT, expectedLength: 3 },
    ].forEach(function ({ expectedRendering, item, expectedLength }) {
      test(`Should render a ${expectedRendering}`, function (assert) {
        // Then
        assert.dom(item).exists({ count: expectedLength });
        assert.strictEqual(find(item).nodeName, expectedRendering.toUpperCase());
      });
    });

    [
      { item: LABEL, expectedRendering: 'label', expectedText: LABEL_TEXT },
      { item: `${MESSAGE}#dayValidationMessage`, expectedRendering: 'div.message', expectedText: 'day message' },
      { item: `${MESSAGE}#monthValidationMessage`, expectedRendering: 'div.message', expectedText: 'month message' },
      { item: `${MESSAGE}#yearValidationMessage`, expectedRendering: 'div.message', expectedText: 'year message' },
    ].forEach(function ({ item, expectedRendering, expectedText }) {
      test(`Should render a ${expectedRendering}`, function (assert) {
        // Then
        assert.ok(find(item).textContent.includes(expectedText));
      });
    });
  });

  module('#Component Interactions', function () {
    test('should handle action <validate> when input lost focus', async function (assert) {
      // given
      const isActionValidateHandled = { day: false, month: false, year: false };
      const inputValueToValidate = { day: null, month: null, year: null };
      const expectedInputValue = { day: '10', month: '12', year: '2010' };

      this.set('validateStub', function (attribute, value) {
        isActionValidateHandled[attribute] = true;
        inputValueToValidate[attribute] = value;
      });

      this.set('label', 'date');
      this.set('dayValidationStatus', '');
      this.set('monthValidationStatus', '');
      this.set('yearValidationStatus', '');
      this.set('dayTextfieldName', 'day');
      this.set('monthTextfieldName', 'month');
      this.set('yearTextfieldName', 'year');
      this.set('dayOfBirth', inputValueToValidate['day']);
      this.set('monthOfBirth', inputValueToValidate['month']);
      this.set('yearOfBirth', inputValueToValidate['year']);

      await render(hbs`<FormTextfieldDate
        @label={{this.label}}
        @dayInputBindingValue={{this.dayOfBirth}}
        @monthInputBindingValue={{this.monthOfBirth}}
        @yearInputBindingValue={{this.yearOfBirth}}
        @dayValidationStatus={{this.dayValidationStatus}}
        @monthValidationStatus={{this.monthValidationStatus}}
        @yearValidationStatus={{this.yearValidationStatus}}
        @dayValidationMessage={{this.dayValidationMessage}}
        @monthValidationMessage={{this.monthValidationMessage}}
        @yearValidationMessage={{this.yearValidationMessage}}
        @dayTextfieldName={{this.dayTextfieldName}}
        @monthTextfieldName={{this.monthTextfieldName}}
        @yearTextfieldName={{this.yearTextfieldName}}
        @onValidateDay={{this.validateStub}}
        @onValidateMonth={{this.validateStub}}
        @onValidateYear={{this.validateStub}}
      />`);

      // when
      await fillIn('#day', '10');
      await triggerEvent('#day', 'focusout');

      await fillIn('#month', '12');
      await triggerEvent('#month', 'focusout');

      await fillIn('#year', '2010');
      await triggerEvent('#year', 'focusout');

      // then
      assert.true(isActionValidateHandled.day);
      assert.true(isActionValidateHandled.month);
      assert.true(isActionValidateHandled.year);
      assert.deepEqual(inputValueToValidate, expectedInputValue);
    });

    module('#When validationStatus gets "default", Component should ', function (hooks) {
      hooks.beforeEach(async function () {
        this.set('label', 'date');
        this.set('dayValidationStatus', 'default');
        this.set('monthValidationStatus', 'default');
        this.set('yearValidationStatus', 'default');
        this.set('dayTextfieldName', 'day');
        this.set('monthTextfieldName', 'month');
        this.set('yearTextfieldName', 'year');
        this.set('dayValidationMessage', '');
        this.set('monthValidationMessage', '');
        this.set('yearValidationMessage', '');
        this.set('validateStub', () => {});

        // When
        await render(hbs`<FormTextfieldDate
          @label={{this.label}}
          @dayValidationStatus={{this.dayValidationStatus}}
          @monthValidationStatus={{this.monthValidationStatus}}
          @yearValidationStatus={{this.yearValidationStatus}}
          @dayValidationMessage={{this.dayValidationMessage}}
          @monthValidationMessage={{this.monthValidationMessage}}
          @yearValidationMessage={{this.yearValidationMessage}}
          @dayTextfieldName={{this.dayTextfieldName}}
          @monthTextfieldName={{this.monthTextfieldName}}
          @yearTextfieldName={{this.yearTextfieldName}}
          @onValidateDay={{this.validateStub}}
          @onValidateMonth={{this.validateStub}}
          @onValidateYear={{this.validateStub}}
        />`);
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

      test('should not show a div for message validation status when validationStatus is default', function (assert) {
        // then
        assert.dom(MESSAGE).doesNotExist();
      });
    });

    module('#When validationStatus gets "error", Component should ', function (hooks) {
      hooks.beforeEach(async function () {
        this.set('label', 'date');
        this.set('dayValidationStatus', 'error');
        this.set('monthValidationStatus', 'error');
        this.set('yearValidationStatus', 'error');
        this.set('dayTextfieldName', 'day');
        this.set('monthTextfieldName', 'month');
        this.set('yearTextfieldName', 'year');
        this.set('dayValidationMessage', 'day message');
        this.set('monthValidationMessage', 'month message');
        this.set('yearValidationMessage', 'year message');
        this.set('validateStub', () => {});

        // When
        await render(hbs`<FormTextfieldDate
          @label={{this.label}}
          @dayValidationStatus={{this.dayValidationStatus}}
          @monthValidationStatus={{this.monthValidationStatus}}
          @yearValidationStatus={{this.yearValidationStatus}}
          @dayValidationMessage={{this.dayValidationMessage}}
          @monthValidationMessage={{this.monthValidationMessage}}
          @yearValidationMessage={{this.yearValidationMessage}}
          @dayTextfieldName={{this.dayTextfieldName}}
          @monthTextfieldName={{this.monthTextfieldName}}
          @yearTextfieldName={{this.yearTextfieldName}}
          @onValidateDay={{this.validateStub}}
          @onValidateMonth={{this.validateStub}}
          @onValidateYear={{this.validateStub}}
        />`);
      });

      test('return true if any img does exist', function (assert) {
        // then
        assert.dom('img').exists({ count: 3 });
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
        this.set('label', 'date');
        this.set('dayValidationStatus', 'success');
        this.set('monthValidationStatus', 'success');
        this.set('yearValidationStatus', 'success');
        this.set('dayTextfieldName', 'day');
        this.set('monthTextfieldName', 'month');
        this.set('dayValidationMessage', 'day message');
        this.set('monthValidationMessage', 'month message');
        this.set('yearValidationMessage', 'year message');
        this.set('validateStub', () => {});

        // When
        await render(hbs`<FormTextfieldDate
          @label={{this.label}}
          @dayValidationStatus={{this.dayValidationStatus}}
          @monthValidationStatus={{this.monthValidationStatus}}
          @yearValidationStatus={{this.yearValidationStatus}}
          @dayValidationMessage={{this.dayValidationMessage}}
          @monthValidationMessage={{this.monthValidationMessage}}
          @yearValidationMessage={{this.yearValidationMessage}}
          @dayTextfieldName={{this.dayTextfieldName}}
          @monthTextfieldName={{this.monthTextfieldName}}
          @yearTextfieldName={{this.yearTextfieldName}}
          @onValidateDay={{this.validateStub}}
          @onValidateMonth={{this.validateStub}}
          @onValidateYear={{this.validateStub}}
        />`);
      });

      test('return true if any img does exist', function (assert) {
        // then
        assert.dom('img').exists({ count: 3 });
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
  });
});
