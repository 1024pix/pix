import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { fillIn, find, triggerEvent } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import FormTextfieldDate from 'mon-pix/components/form-textfield-date';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

class DateState {
  @tracked dayOfBirth;
  @tracked monthOfBirth;
  @tracked yearOfBirth;
  @tracked dayValidationMessage;
  @tracked monthValidationMessage;
  @tracked yearValidationMessage;
}

module('Integration | Component | form textfield date', function (hooks) {
  setupIntlRenderingTest(hooks);

  const LABEL = '.form-textfield__label';
  const LABEL_TEXT = 'date';

  const MESSAGE = '.form-textfield__message';

  module('#Component rendering', function (hooks) {
    hooks.beforeEach(async function () {
      const label = 'date';
      const dayValidationStatus = '';
      const monthValidationStatus = '';
      const yearValidationStatus = '';
      const dayTextfieldName = 'day';
      const monthTextfieldName = 'month';
      const yearTextfieldName = 'year';
      const dayValidationMessage = 'day message';
      const monthValidationMessage = 'month message';
      const yearValidationMessage = 'year message';
      const validateStub = () => {};
      const handleInputStub = () => {};
      // When
      await render(
        <template>
          <FormTextfieldDate
            @label={{label}}
            @dayValidationStatus={{dayValidationStatus}}
            @monthValidationStatus={{monthValidationStatus}}
            @yearValidationStatus={{yearValidationStatus}}
            @dayValidationMessage={{dayValidationMessage}}
            @monthValidationMessage={{monthValidationMessage}}
            @yearValidationMessage={{yearValidationMessage}}
            @dayTextfieldName={{dayTextfieldName}}
            @monthTextfieldName={{monthTextfieldName}}
            @yearTextfieldName={{yearTextfieldName}}
            @onValidateDay={{validateStub}}
            @onValidateMonth={{validateStub}}
            @onValidateYear={{validateStub}}
            @onDayInput={{handleInputStub}}
            @onMonthInput={{handleInputStub}}
            @onYearInput={{handleInputStub}}
          />
        </template>,
      );
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
        const label = 'date';
        const dayValidationStatus = status;
        const monthValidationStatus = status;
        const yearValidationStatus = status;
        const dayValidationMessage = 'day message';
        const monthValidationMessage = 'month message';
        const yearValidationMessage = 'year message';
        const validateStub = () => {};
        const handleInputStub = () => {};

        // when
        await render(
          <template>
            <FormTextfieldDate
              @label={{label}}
              @dayValidationStatus={{dayValidationStatus}}
              @monthValidationStatus={{monthValidationStatus}}
              @yearValidationStatus={{yearValidationStatus}}
              @dayValidationMessage={{dayValidationMessage}}
              @monthValidationMessage={{monthValidationMessage}}
              @yearValidationMessage={{yearValidationMessage}}
              @onValidateDay={{validateStub}}
              @onValidateMonth={{validateStub}}
              @onValidateYear={{validateStub}}
              @onDayInput={{handleInputStub}}
              @onMonthInput={{handleInputStub}}
              @onYearInput={{handleInputStub}}
            />
          </template>,
        );

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

      const validateStub = function (attribute, value) {
        isActionValidateHandled[attribute] = true;
        inputValueToValidate[attribute] = value;
      };

      const label = 'date';
      const dayValidationStatus = '';
      const monthValidationStatus = '';
      const yearValidationStatus = '';
      const dayTextfieldName = 'day';
      const monthTextfieldName = 'month';
      const yearTextfieldName = 'year';
      const state = new DateState();
      state.dayOfBirth = inputValueToValidate['day'];
      state.monthOfBirth = inputValueToValidate['month'];
      state.yearOfBirth = inputValueToValidate['year'];
      const handleDayInput = (event) => {
        state.dayOfBirth = event.target.value;
      };
      const handleMonthInput = (event) => {
        state.monthOfBirth = event.target.value;
      };
      const handleYearInput = (event) => {
        state.yearOfBirth = event.target.value;
      };

      await render(
        <template>
          <FormTextfieldDate
            @label={{label}}
            @dayValue={{state.dayOfBirth}}
            @monthValue={{state.monthOfBirth}}
            @yearValue={{state.yearOfBirth}}
            @dayValidationStatus={{dayValidationStatus}}
            @monthValidationStatus={{monthValidationStatus}}
            @yearValidationStatus={{yearValidationStatus}}
            @dayValidationMessage={{state.dayValidationMessage}}
            @monthValidationMessage={{state.monthValidationMessage}}
            @yearValidationMessage={{state.yearValidationMessage}}
            @dayTextfieldName={{dayTextfieldName}}
            @monthTextfieldName={{monthTextfieldName}}
            @yearTextfieldName={{yearTextfieldName}}
            @onValidateDay={{validateStub}}
            @onValidateMonth={{validateStub}}
            @onValidateYear={{validateStub}}
            @onDayInput={{handleDayInput}}
            @onMonthInput={{handleMonthInput}}
            @onYearInput={{handleYearInput}}
          />
        </template>,
      );

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
