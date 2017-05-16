import {expect} from 'chai';
import {describe, it} from 'mocha';
import {setupComponentTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | signup textfield', function() {
  setupComponentTest('signup-textfield', {
    integration: true
  });

  const LABEL = '.signup-textfield__label';
  const LABEL_TEXT = 'NOM';

  const MESSAGE = '.signup-textfield__message';
  const MESSAGE_ERROR_STATUS = 'signup-textfield__message--error';
  const MESSAGE_SUCCESS_STATUS = 'signup-textfield__message--success';
  const MESSAGE_TEXT = '';

  const INPUT = '.signup-textfield__input';
  const INPUT_DEFAULT_CLASS = 'signup-textfield__input--default';
  const INPUT_SUCCESS_CLASS = 'signup-textfield__input--success';
  const INPUT_ERROR_CLASS = 'signup-textfield__input--error';

  describe('#Component rendering', function() {
    beforeEach(function() {
      this.set('label', 'nom');
      this.set('validationStatus', '');
      this.set('textfieldName', 'firstname');

      // When
      this.render(hbs`{{signup-textfield label=label validationStatus=validationStatus textfieldName=textfieldName}}`);
    });

    [
      {expectedRendering: 'label', item: LABEL, expectedLength: 1},
      {expectedRendering: 'div', item: MESSAGE, expectedLength: 1},
      {expectedRendering: 'input', item: INPUT, expectedLength: 1},
      {expectedRendering: 'div', item: '', expectedLength: 1},

    ].forEach(function({expectedRendering, item, expectedLength}) {
      it(`Should render a ${expectedRendering}`, function() {
        // Then
        expect(this.$(item)).to.have.length(expectedLength);
        expect(this.$(item).prop('nodeName')).to.equal(expectedRendering.toUpperCase());
      });
    });

    [
      {item: LABEL, expectedRendering: 'label', expectedText: LABEL_TEXT},
      {item: MESSAGE, expectedRendering: 'div.message', expectedText: MESSAGE_TEXT},

    ].forEach(function({item, expectedRendering, expectedText}) {
      it(`Should render a ${expectedRendering}`, function() {
        // Then
        expect(this.$(item).text().toUpperCase()).to.equal(expectedText);
      });
    });

  });

  //behavior
  describe('#Component Interactions', function() {

    it('should handle action <validate> when input lost focus', function() {
      // given
      let isActionValidateHandled = false;
      let inputValueToValidate;
      const expectedInputValue = 'firstname';

      this.on('validate', function(arg) {
        isActionValidateHandled = true;
        inputValueToValidate = arg;
      });

      this.set('label', 'nom');
      this.set('validationStatus', '');
      this.set('textfieldName', 'firstname');

      this.render(hbs`{{signup-textfield label=label validationStatus=validationStatus textfieldName=textfieldName validate="validate"}}`);
      // when
      this.$(INPUT).val('pix');
      this.$(INPUT).trigger('focusout');
      // then
      return wait().then(() => {
        expect(isActionValidateHandled).to.be.true;
        expect(inputValueToValidate).to.deep.equal(expectedInputValue);
      });
    });

    describe('#When validationStatus gets "default", Component should ', function() {
      beforeEach(function() {
        this.set('label', 'nom');
        this.set('validationStatus', 'default');
        this.set('textfieldName', 'firstname');
        this.set('validationMessage', '');

        // When
        this.render(hbs`{{signup-textfield label=label validationStatus=validationStatus validationMessage=validationMessage textfieldName=textfieldName}}`);
      });

      it('return true if any svg doesn\'t exist', function() {
        // then
        expect(this.$('svg')).to.have.length(0);
      });

      it(`contain an input with an additional class ${INPUT_DEFAULT_CLASS}`, function() {
        const input = this.$(INPUT);
        // then
        expect(input.attr('class')).to.contain(INPUT_DEFAULT_CLASS);
        expect(input.val()).to.contain('');
      });

      it('should not show a div for message validation status  when validationStatus is default', function() {
        // then
        expect(this.$(MESSAGE)).to.lengthOf(0);
      });

    });

  });

  describe('#When validationStatus gets "error", Component should ', function() {
    beforeEach(function() {
      this.set('label', 'nom');
      this.set('validationStatus', 'error');
      this.set('textfieldName', 'firstname');

      // When
      this.render(hbs`{{signup-textfield label=label validationStatus=validationStatus validationMessage=validationMessage textfieldName=textfieldName}}`);
      this.set('validationMessage', '');
    });

    it('return true if any svg does exist', function() {
      // then
      return wait().then(() => {
        expect(this.$('svg')).to.have.length(1);
        expect(this.$('svg').attr('class')).to.equal('validation-icon-error');
      });
    });

    [

      {item: 'Input', itemSelector: INPUT, expectedClass: INPUT_ERROR_CLASS},
      {item: 'Div for message validation status', itemSelector: MESSAGE, expectedClass: MESSAGE_ERROR_STATUS},

    ].forEach(({item, itemSelector, expectedClass}) => {
      it(`contain an ${item} with an additional class ${expectedClass}`, function() {
        // then
        expect(this.$(itemSelector).attr('class')).to.contain(expectedClass);
      });
    });

  });

  describe('#When validationStatus gets "success", Component should ', function() {
    beforeEach(function() {
      this.set('label', 'nom');
      this.set('validationStatus', 'success');
      this.set('validationMessage', '');
      this.set('textfieldName', 'firstname');

      // When
      this.render(hbs`{{signup-textfield label=label validationStatus=validationStatus validationMessage=validationMessage textfieldName=textfieldName}}`);
    });

    it('return true if any svg does exist', function() {
      // then
      expect(this.$('svg')).to.have.length(1);
      expect(this.$('svg').attr('class')).to.equal('validation-icon-success');
    });

    [

      {item: 'Input', itemSelector: INPUT, expectedClass: INPUT_SUCCESS_CLASS},
      {item: 'Div for message validation status', itemSelector: MESSAGE, expectedClass: MESSAGE_SUCCESS_STATUS},

    ].forEach(({item, itemSelector, expectedClass}) => {
      it(`contain an ${item} with an additional class ${expectedClass}`, function() {
        // then
        expect(this.$(itemSelector).attr('class')).to.contain(expectedClass);
      });
    });

  });

});
