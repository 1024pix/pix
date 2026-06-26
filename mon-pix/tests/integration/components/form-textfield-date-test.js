import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { fillIn, find, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | form textfield date', function (hooks) {
  setupIntlRenderingTest(hooks);

  const LABEL = '.form-textfield__label';
  const LABEL_TEXT = 'date';

  const MESSAGE = '.form-textfield__message';

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
      this.set('handleInputStub', () => {});
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
  @onDayInput={{this.handleInputStub}}
  @onMonthInput={{this.handleInputStub}}
  @onYearInput={{this.handleInputStub}}
/>`);
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

  module('#Validation message status class', function () {
    [
      { status: 'default', expectedClass: 'form-textfield__message--default' },
      { status: 'error', expectedClass: 'form-textfield__message--error' },
      { status: 'success', expectedClass: 'form-textfield__message--success' },
    ].forEach(function ({ status, expectedClass }) {
      test(`should set the "${expectedClass}" class on each validation message when status is "${status}"`, async function (assert) {
        // given
        this.set('label', 'date');
        this.set('dayValidationStatus', status);
        this.set('monthValidationStatus', status);
        this.set('yearValidationStatus', status);
        this.set('dayValidationMessage', 'day message');
        this.set('monthValidationMessage', 'month message');
        this.set('yearValidationMessage', 'year message');
        this.set('validateStub', () => {});
        this.set('handleInputStub', () => {});

        // when
        await render(hbs`<FormTextfieldDate
  @label={{this.label}}
  @dayValidationStatus={{this.dayValidationStatus}}
  @monthValidationStatus={{this.monthValidationStatus}}
  @yearValidationStatus={{this.yearValidationStatus}}
  @dayValidationMessage={{this.dayValidationMessage}}
  @monthValidationMessage={{this.monthValidationMessage}}
  @yearValidationMessage={{this.yearValidationMessage}}
  @onValidateDay={{this.validateStub}}
  @onValidateMonth={{this.validateStub}}
  @onValidateYear={{this.validateStub}}
  @onDayInput={{this.handleInputStub}}
  @onMonthInput={{this.handleInputStub}}
  @onYearInput={{this.handleInputStub}}
/>`);

        // then
        assert.dom(`${MESSAGE}#dayValidationMessage`).hasClass(expectedClass);
        assert.dom(`${MESSAGE}#monthValidationMessage`).hasClass(expectedClass);
        assert.dom(`${MESSAGE}#yearValidationMessage`).hasClass(expectedClass);
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
      this.set('handleDayInput', (event) => {
        this.set('dayOfBirth', event.target.value);
      });
      this.set('handleMonthInput', (event) => {
        this.set('monthOfBirth', event.target.value);
      });
      this.set('handleYearInput', (event) => {
        this.set('yearOfBirth', event.target.value);
      });

      await render(hbs`<FormTextfieldDate
  @label={{this.label}}
  @dayValue={{this.dayOfBirth}}
  @monthValue={{this.monthOfBirth}}
  @yearValue={{this.yearOfBirth}}
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
  @onDayInput={{this.handleDayInput}}
  @onMonthInput={{this.handleMonthInput}}
  @onYearInput={{this.handleYearInput}}
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
  });
});
