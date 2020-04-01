import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  fillIn,
  find,
  findAll,
  render,
  settled,
  triggerEvent
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | form textfield date', function() {
  setupRenderingTest();

  const LABEL = '.form-textfield__label';
  const LABEL_TEXT = 'date';

  const MESSAGE = '.form-textfield__message';
  const MESSAGE_ERROR_STATUS = 'form-textfield__message--error';
  const MESSAGE_SUCCESS_STATUS = 'form-textfield__message--success';

  const INPUT = '.form-textfield__input';
  const INPUT_DEFAULT_CLASS = 'form-textfield__input--default';
  const INPUT_SUCCESS_CLASS = 'form-textfield__input--success';
  const INPUT_ERROR_CLASS = 'form-textfield__input--error';

  describe('#Component rendering', function() {
    beforeEach(async function() {
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

      // When
      await render(hbs`{{form-textfield-date label=label 
        dayValidationStatus=dayValidationStatus monthValidationStatus=monthValidationStatus yearValidationStatus=yearValidationStatus
        dayValidationMessage=dayValidationMessage monthValidationMessage=monthValidationMessage yearValidationMessage=yearValidationMessage
        dayTextfieldName=dayTextfieldName monthTextfieldName=monthTextfieldName yearTextfieldName=yearTextfieldName}}`);
    });

    [
      { expectedRendering: 'label', item: LABEL, expectedLength: 1 },
      { expectedRendering: 'div', item: MESSAGE, expectedLength: 3 },
      { expectedRendering: 'input', item: INPUT, expectedLength: 3 },

    ].forEach(function({ expectedRendering, item, expectedLength }) {
      it(`Should render a ${expectedRendering}`, function() {
        // Then
        expect(findAll(item)).to.have.length(expectedLength);
        expect(find(item).nodeName).to.equal(expectedRendering.toUpperCase());
      });
    });

    [
      { item: LABEL, expectedRendering: 'label', expectedText: LABEL_TEXT },
      { item: `${MESSAGE}#dayValidationMessage`, expectedRendering: 'div.message', expectedText: 'day message' },
      { item: `${MESSAGE}#monthValidationMessage`, expectedRendering: 'div.message', expectedText: 'month message' },
      { item: `${MESSAGE}#yearValidationMessage`, expectedRendering: 'div.message', expectedText: 'year message' }

    ].forEach(function({ item, expectedRendering, expectedText }) {
      it(`Should render a ${expectedRendering}`, function() {
        // Then
        expect(find(item).textContent).to.contains(expectedText);
      });
    });

  });

  describe('#Component Interactions', function() {

    it('should handle action <validate> when input lost focus', async function() {
      // given
      const isActionValidateHandled = { day: false, month: false, year: false };
      const inputValueToValidate = { day: null, month: null, year: null };
      const expectedInputValue = { day: '10', month: '12', year: '2010' };

      this.set('validate', function(attribute, value) {
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

      await render(hbs`{{form-textfield-date label=label 
        dayValidationStatus=dayValidationStatus monthValidationStatus=monthValidationStatus yearValidationStatus=yearValidationStatus
        dayTextfieldName=dayTextfieldName monthTextfieldName=monthTextfieldName yearTextfieldName=yearTextfieldName
        onValidateDay=(action validate) onValidateMonth=(action validate) onValidateYear=(action validate)}}`);
      // when
      await fillIn('#day', '10');
      await fillIn('#month', '12');
      await fillIn('#year', '2010');
      await triggerEvent('#year', 'blur');
      // then
      expect(isActionValidateHandled.day).to.be.true;
      expect(isActionValidateHandled.month).to.be.true;
      expect(isActionValidateHandled.year).to.be.true;
      expect(inputValueToValidate).to.deep.equal(expectedInputValue);
    });

    describe('#When validationStatus gets "default", Component should ', function() {
      beforeEach(async function() {
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

        // When
        await render(hbs`{{form-textfield-date label=label 
          dayValidationStatus=dayValidationStatus monthValidationStatus=monthValidationStatus yearValidationStatus=yearValidationStatus
          dayValidationMessage=dayValidationMessage monthValidationMessage=monthValidationMessage yearValidationMessage=yearValidationMessage
          dayTextfieldName=dayTextfieldName monthTextfieldName=monthTextfieldName yearTextfieldName=yearTextfieldName}}`);
      });

      it('return true if any svg doesn\'t exist', function() {
        // then
        expect(findAll('img')).to.have.lengthOf(0);
      });

      it(`contain an input with an additional class ${INPUT_DEFAULT_CLASS}`, function() {
        const input = find(INPUT);
        // then
        expect(input.getAttribute('class')).to.contain(INPUT_DEFAULT_CLASS);
        expect(input.value).to.contain('');
      });

      it('should not show a div for message validation status when validationStatus is default', function() {
        // then
        expect(find(MESSAGE)).to.not.exist;
      });

    });

    describe('#When validationStatus gets "error", Component should ', function() {
      beforeEach(async function() {
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

        // When
        await render(hbs`{{form-textfield-date label=label 
        dayValidationStatus=dayValidationStatus monthValidationStatus=monthValidationStatus yearValidationStatus=yearValidationStatus
        dayValidationMessage=dayValidationMessage monthValidationMessage=monthValidationMessage yearValidationMessage=yearValidationMessage
        dayTextfieldName=dayTextfieldName monthTextfieldName=monthTextfieldName yearTextfieldName=yearTextfieldName}}`);
      });

      it('return true if any img does exist', function() {
        // then
        return settled().then(() => {
          expect(findAll('img')).to.have.lengthOf(3);
          expect(find('img').getAttribute('class')).to.contain('form-textfield-icon__state--error');
        });
      });

      [
        { item: 'Input', itemSelector: INPUT, expectedClass: INPUT_ERROR_CLASS },
        { item: 'Div for message validation status', itemSelector: MESSAGE, expectedClass: MESSAGE_ERROR_STATUS },

      ].forEach(({ item, itemSelector, expectedClass }) => {
        it(`contain an ${item} with an additional class ${expectedClass}`, function() {
          // then
          expect(find(itemSelector).getAttribute('class')).to.contain(expectedClass);
        });
      });

    });

    describe('#When validationStatus gets "success", Component should ', function() {
      beforeEach(async function() {
        this.set('label', 'date');
        this.set('dayValidationStatus', 'success');
        this.set('monthValidationStatus', 'success');
        this.set('yearValidationStatus', 'success');
        this.set('dayTextfieldName', 'day');
        this.set('monthTextfieldName', 'month');
        this.set('dayValidationMessage', 'day message');
        this.set('monthValidationMessage', 'month message');
        this.set('yearValidationMessage', 'year message');

        // When
        await render(hbs`{{form-textfield-date label=label 
        dayValidationStatus=dayValidationStatus monthValidationStatus=monthValidationStatus yearValidationStatus=yearValidationStatus
        dayValidationMessage=dayValidationMessage monthValidationMessage=monthValidationMessage yearValidationMessage=yearValidationMessage
        dayTextfieldName=dayTextfieldName monthTextfieldName=monthTextfieldName yearTextfieldName=yearTextfieldName}}`);
      });

      it('return true if any img does exist', function() {
        // then
        expect(findAll('img')).to.have.lengthOf(3);
        expect(find('img').getAttribute('class')).to.contain('form-textfield-icon__state--success');
      });

      [
        { item: 'Input', itemSelector: INPUT, expectedClass: INPUT_SUCCESS_CLASS },
        { item: 'Div for message validation status', itemSelector: MESSAGE, expectedClass: MESSAGE_SUCCESS_STATUS },

      ].forEach(({ item, itemSelector, expectedClass }) => {
        it(`contain an ${item} with an additional class ${expectedClass}`, function() {
          // then
          expect(find(itemSelector).getAttribute('class')).to.contain(expectedClass);
        });
      });
    });
  });
});
