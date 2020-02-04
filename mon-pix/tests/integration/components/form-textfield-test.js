import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  click,
  fillIn,
  find,
  findAll,
  render,
  settled,
  triggerEvent
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | form textfield', function() {
  setupRenderingTest();

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

  describe('#Component rendering', function() {
    beforeEach(async function() {
      this.set('label', 'nom');
      this.set('validationStatus', '');
      this.set('validationMessage', MESSAGE_TEXT);
      this.set('textfieldName', 'firstname');

      // When
      await render(hbs`{{form-textfield label=label validationStatus=validationStatus validationMessage=validationMessage textfieldName=textfieldName}}`);
    });

    [
      { expectedRendering: 'label', item: LABEL, expectedLength: 1 },
      { expectedRendering: 'div', item: MESSAGE, expectedLength: 1 },
      { expectedRendering: 'input', item: INPUT, expectedLength: 1 },

    ].forEach(function({ expectedRendering, item, expectedLength }) {
      it(`Should render a ${expectedRendering}`, function() {
        // Then
        expect(findAll(item)).to.have.length(expectedLength);
        expect(find(item).nodeName).to.equal(expectedRendering.toUpperCase());
      });
    });

    [
      { item: LABEL, expectedRendering: 'label', expectedText: LABEL_TEXT },
      { item: MESSAGE, expectedRendering: 'div.message', expectedText: MESSAGE_TEXT }

    ].forEach(function({ item, expectedRendering, expectedText }) {
      it(`Should render a ${expectedRendering}`, function() {
        // Then
        expect(find(item).textContent.toUpperCase()).to.contains(expectedText);
      });
    });

  });

  describe('#Component Interactions', function() {

    it('should handle action <validate> when input lost focus', async function() {
      // given
      let isActionValidateHandled = false;
      let inputValueToValidate;
      const expectedInputValue = 'firstname';

      this.set('validate', function(arg) {
        isActionValidateHandled = true;
        inputValueToValidate = arg;
      });

      this.set('label', 'nom');
      this.set('validationStatus', '');
      this.set('validationMessage', 'message');
      this.set('textfieldName', 'firstname');

      await render(hbs`{{form-textfield label=label validationStatus=validationStatus validationMessage=validationMessage textfieldName=textfieldName onValidate=(action validate)}}`);
      // when
      await fillIn(INPUT, 'pix');
      await triggerEvent(INPUT, 'blur');
      // then
      return settled().then(() => {
        expect(isActionValidateHandled).to.be.true;
        expect(inputValueToValidate).to.deep.equal(expectedInputValue);
      });
    });

    describe('#When validationStatus gets "default", Component should ', function() {
      beforeEach(async function() {
        this.set('label', 'nom');
        this.set('validationStatus', 'default');
        this.set('textfieldName', 'firstname');
        this.set('validationMessage', 'message');

        // When
        await render(hbs`{{form-textfield label=label validationStatus=validationStatus validationMessage=validationMessage textfieldName=textfieldName}}`);
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
    });

    describe('#When validationStatus gets "error", Component should ', function() {
      beforeEach(async function() {
        this.set('label', 'nom');
        this.set('validationStatus', 'error');
        this.set('textfieldName', 'firstname');
        this.set('validationMessage', 'message');

        // When
        await render(hbs`{{form-textfield label=label validationStatus=validationStatus validationMessage=validationMessage textfieldName=textfieldName}}`);
      });

      it('return true if any img does exist', function() {
        // then
        return settled().then(() => {
          expect(findAll('img')).to.have.lengthOf(1);
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
        this.set('label', 'nom');
        this.set('validationStatus', 'success');
        this.set('validationMessage', 'message');
        this.set('textfieldName', 'firstname');

        // When
        await render(hbs`{{form-textfield label=label validationStatus=validationStatus validationMessage=validationMessage textfieldName=textfieldName}}`);
      });

      it('return true if any img does exist', function() {
        // then
        expect(findAll('img')).to.have.lengthOf(1);
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

    describe('#When password is hidden', function() {
      this.beforeEach(async function() {
        this.set('label', 'Mot de passe');
        this.set('validationStatus', 'default');
        this.set('validationMessage', 'message');
        this.set('textfieldName', 'password');

        // given
        await render(hbs`{{form-textfield label=label validationStatus=validationStatus validationMessage=validationMessage textfieldName=textfieldName value=inputValue}}`);
      });

      it('should change type when user click on eye icon', async function() {
        // when
        await click('.form-textfield-icon__button');

        // then
        expect(find('input').getAttribute('type')).to.equal('text');
      });

      it('should change icon when user click on it', async function() {
        // when
        expect(find('.fa-eye-slash')).to.exist;
        await click('.form-textfield-icon__button');

        // then
        expect(find('.fa-eye')).to.exist;
      });

      it('should not change icon when user keeps typing his password', async function() {
        // given
        await fillIn(INPUT, 'test');

        // when
        expect(find('.fa-eye-slash')).to.exist;
        await click('.form-textfield-icon__button');
        await fillIn(INPUT, 'test');
      });
    });
  });
});
