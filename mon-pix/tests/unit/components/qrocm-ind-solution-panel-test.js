import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';

describe('Unit | Component | qrocm-ind-solution-panel', function() {

  setupTest();
  setupIntl();

  describe('#blocks', function() {

    let challenge;
    let answer;
    let solution;

    beforeEach(function() {
      challenge = {};
      answer = {};
      solution = '';
    });

    it('should return an array with data to display (case when the answers are right)', function() {
      //Given
      challenge = EmberObject.create({ proposals: 'content : ${smiley1}\n\ntriste : ${smiley2}' });
      answer = { value: 'smiley1: \':)\' smiley2: \':(\'', resultDetails: 'smiley1: true\nsmiley2: true' };
      solution = 'smiley1: \n - :-)\n - :)\n - :-D\n - :D\n - :))\n\nsmiley2:\n - :-(\n - :(\n - :((';

      const expectedBlocksData = [{
        input: 'smiley1',
        text: 'content :',
        ariaLabel: null,
        showText: false,
        inputClass: 'correction-qroc-box-answer--correct',
        answer: ':)',
        solution: ':-)',
        emptyOrWrongAnswer: false,
        placeholder: undefined,
      }, {
        breakline: true,
        showText: undefined,
      }, {
        input: 'smiley2',
        text: 'triste :',
        ariaLabel: null,
        showText: false,
        inputClass: 'correction-qroc-box-answer--correct',
        answer: ':(',
        solution: ':-(',
        emptyOrWrongAnswer: false,
        placeholder: undefined,
      }];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      expect(component.blocks).to.be.deep.equal(expectedBlocksData);
    });

    it('should return an array with data to display (case when there is wrong answers)', function() {
      //Given
      challenge = EmberObject.create({ proposals: 'Clé USB : ${num1}\n\nCarte mémoire (SD) : ${num2}' });
      answer = { value: 'num1: \'1\' num2: \'2\'', resultDetails: 'num1: false\nnum2: false' };
      solution = 'num1: \n - 2\n\nnum2:\n - 1';
      const result = [{
        input: 'num1',
        text: 'Clé USB :',
        ariaLabel: null,
        showText: false,
        inputClass: 'correction-qroc-box-answer--wrong',
        answer: '1',
        solution: '2',
        emptyOrWrongAnswer: true,
        placeholder: undefined,
      }, {
        breakline: true,
        showText: undefined,
      }, {
        input: 'num2',
        text: 'Carte mémoire (SD) :',
        ariaLabel: null,
        showText: false,
        inputClass: 'correction-qroc-box-answer--wrong',
        answer: '2',
        solution: '1',
        emptyOrWrongAnswer: true,
        placeholder: undefined,
      }];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      expect(component.blocks).to.be.deep.equal(result);
    });

    it('should return an array with data to display (case when there is some empty answer)', function() {
      //Given
      challenge = EmberObject.create({ proposals: 'Clé USB : ${num1}\n\nCarte mémoire (SD) : ${num2}' });
      answer = { value: 'num1: \'\' num2: \'2\'', resultDetails: 'num1: false\nnum2: false' };
      solution = 'num1: \n - 2\n\nnum2:\n - 1';

      const result = [{
        input: 'num1',
        text: 'Clé USB :',
        ariaLabel: null,
        showText: false,
        inputClass: 'correction-qroc-box-answer--aband',
        answer: 'Pas de réponse',
        solution: '2',
        emptyOrWrongAnswer: true,
        placeholder: undefined,
      }, {
        breakline: true,
        showText: undefined,
      }, {
        input: 'num2',
        text: 'Carte mémoire (SD) :',
        ariaLabel: null,
        showText: false,
        inputClass: 'correction-qroc-box-answer--wrong',
        answer: '2',
        solution: '1',
        emptyOrWrongAnswer: true,
        placeholder: undefined,
      }];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      expect(component.blocks).to.be.deep.equal(result);
    });

    it('should return an array with data to display (proposals contains a dash ("-"))', function() {
      // given
      challenge = EmberObject.create({ proposals: '- alain@pix.fr : ${num1}\n\n- leonie@pix.fr : ${num2}' });
      answer = {
        value: 'num1: \'1\' num2: \'2\'',
        resultDetails: 'num1: false\nnum2: false',
      };
      solution = 'num1: \n - 2\n\nnum2:\n - 3';

      const result = [{
        input: 'num1',
        text: '- alain@pix.fr :',
        ariaLabel: null,
        showText: false,
        inputClass: 'correction-qroc-box-answer--wrong',
        answer: '1',
        solution: '2',
        emptyOrWrongAnswer: true,
        placeholder: undefined,
      }, {
        breakline: true,
        showText: undefined,
      }, {
        input: 'num2',
        text: '- leonie@pix.fr :',
        ariaLabel: null,
        showText: false,
        inputClass: 'correction-qroc-box-answer--wrong',
        answer: '2',
        solution: '3',
        emptyOrWrongAnswer: true,
        placeholder: undefined,
      }];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      expect(component.blocks).to.be.deep.equal(result);
    });

    it('should return an array with data to display (proposals are questions)', function() {
      // given
      challenge = EmberObject.create({ proposals: '- Combien le dossier "projet PIX" contient-il de dossiers ? ${Num1}\n\n- Combien le dossier "images" contient-il de fichiers ? ${Num2}' });
      answer = { value: 'Num1: \'2\' Num2: \'3\'', resultDetails: 'Num1: false\nNum2: false' };
      solution = 'Num1:\n - 1\n\nNum2:\n - 6';

      const result = [{
        input: 'Num1',
        text: '- Combien le dossier "projet PIX" contient-il de dossiers ?',
        ariaLabel: null,
        showText: false,
        inputClass: 'correction-qroc-box-answer--wrong',
        answer: '2',
        solution: '1',
        emptyOrWrongAnswer: true,
        placeholder: undefined,
      }, {
        breakline: true,
        showText: undefined,
      }, {
        input: 'Num2',
        text: '- Combien le dossier "images" contient-il de fichiers ?',
        ariaLabel: null,
        showText: false,
        inputClass: 'correction-qroc-box-answer--wrong',
        answer: '3',
        solution: '6',
        emptyOrWrongAnswer: true,
        placeholder: undefined,
      }];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      expect(component.blocks).to.be.deep.equal(result);
    });

    it('it should return "Pas de réponse" in each answer if the question was passed', function() {
      // given
      challenge = EmberObject.create({ proposals: 'Clé USB : ${num1}\n\nCarte mémoire (SD) : ${num2}' });
      answer = { value: '#ABAND#', resultDetails: 'num1: false\nnum2: false' };
      solution = 'num1: \n - 2\n\nnum2:\n - 1';

      const result = [{
        input: 'num1',
        text: 'Clé USB :',
        ariaLabel: null,
        showText: false,
        inputClass: 'correction-qroc-box-answer--aband',
        answer: 'Pas de réponse',
        solution: '2',
        emptyOrWrongAnswer: true,
        placeholder: undefined,
      }, {
        breakline: true,
        showText: undefined,
      }, {
        input: 'num2',
        text: 'Carte mémoire (SD) :',
        ariaLabel: null,
        showText: false,
        inputClass: 'correction-qroc-box-answer--aband',
        answer: 'Pas de réponse',
        solution: '1',
        emptyOrWrongAnswer: true,
        placeholder: undefined,
      }];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      expect(component.blocks).to.be.deep.equal(result);
    });

    /**
     * _inputClass
     */

    it('should return "correction-qroc-box-answer--correct" CSS class when answer is right', function() {
      // given
      challenge = EmberObject.create({ proposals: 'Clé USB : ${num1}' });
      answer = { value: 'num1: \'2\'', resultDetails: 'num1: true' };
      solution = 'num1: \n - 2';

      const result = [{
        input: 'num1',
        text: 'Clé USB :',
        ariaLabel: null,
        showText: false,
        inputClass: 'correction-qroc-box-answer--correct',
        answer: '2',
        solution: '2',
        emptyOrWrongAnswer: false,
        placeholder: undefined,
      }];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      expect(component.blocks).to.be.deep.equal(result);
    });

  });

});
