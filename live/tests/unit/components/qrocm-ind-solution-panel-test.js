import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | qrocm-solution-panel', function() {

  setupTest('component:qrocm-ind-solution-panel', {});

  describe('#inputFields', function() {

    let challenge;
    let answer;
    let solution;

    beforeEach(function() {
      challenge = {};
      answer = {};
      solution = {};
    });

    function _getComponentInputFields(context) {
      const component = context.subject();
      component.set('challenge', challenge);
      component.set('answer', answer);
      component.set('solution', solution);
      return component.get('inputFields');
    }

    it('should return an array with data to display (case when the answers are right)', function() {
      //Given
      challenge = { proposals: 'content : ${smiley1}\n\ntriste : ${smiley2}' };
      answer = { value: 'smiley1: \':)\' smiley2: \':(\'', resultDetails: 'smiley1: true\nsmiley2: true' };
      solution = { value: 'smiley1: \n - :-)\n - :)\n - :-D\n - :D\n - :))\n\nsmiley2:\n - :-(\n - :(\n - :((' };

      const expectedFieldsData = [{
        label: 'content : ',
        answer: ':)',
        solution: ':-)',
        emptyOrWrongAnswer: false,
        inputClass: 'correction-qroc-box__input-right-answer',
      }, {
        label: 'triste : ',
        answer: ':(',
        solution: ':-(',
        emptyOrWrongAnswer: false,
        inputClass: 'correction-qroc-box__input-right-answer',
      }];

      //when
      const inputFields = _getComponentInputFields(this);

      //Then
      expect(inputFields).to.be.deep.equal(expectedFieldsData);
    });

    it('should return an array with data to display (case when there is wrong answers)', function() {
      //Given
      challenge = { proposals: 'Clé USB : ${num1}\n\nCarte mémoire (SD) : ${num2}' };
      answer = { value: 'num1: \'1\' num2: \'2\'', resultDetails: 'num1: false\nnum2: false' };
      solution = { value: 'num1: \n - 2\n\nnum2:\n - 1' };
      const result = [{
        label: 'Clé USB : ',
        answer: '1',
        solution: '2',
        emptyOrWrongAnswer: true,
        inputClass: 'correction-qroc-box__input-wrong-answer',
      }, {
        label: 'Carte mémoire (SD) : ',
        answer: '2',
        solution: '1',
        emptyOrWrongAnswer: true,
        inputClass: 'correction-qroc-box__input-wrong-answer',
      }];

      //When
      const inputFields = _getComponentInputFields(this);

      //then
      expect(inputFields).to.be.deep.equal(result);

    });

    it('should return an array with data to display (case when there is some empty answer)', function() {
      //Given
      challenge = { proposals: 'Clé USB : ${num1}\n\nCarte mémoire (SD) : ${num2}' };
      answer = { value: 'num1: \'\' num2: \'2\'', resultDetails: 'num1: false\nnum2: false' };
      solution = { value: 'num1: \n - 2\n\nnum2:\n - 1' };

      const result = [{
        label: 'Clé USB : ',
        answer: 'Pas de réponse',
        solution: '2',
        emptyOrWrongAnswer: true,
        inputClass: 'correction-qroc-box__input-no-answer',
      }, {
        label: 'Carte mémoire (SD) : ',
        answer: '2',
        solution: '1',
        emptyOrWrongAnswer: true,
        inputClass: 'correction-qroc-box__input-wrong-answer',
      }];

      //When
      const inputFields = _getComponentInputFields(this);

      //then
      expect(inputFields).to.be.deep.equal(result);
    });

    it('should return an array with data to display (proposals contains a dash ("-"))', function() {
      // given
      challenge = { proposals: '- alain@pix.fr : ${num1}\n\n- leonie@pix.fr : ${num2}\n\n- Programme_Pix.pdf : ${num3}\n\n- lucie@pix.fr : ${num4}\n\n- Programme du festival Pix : ${num5}\n\n- jeremy@pix.fr : ${num6}' };
      answer = {
        value: 'num1: \'1\' num2: \'2\' num3: \'3\' num4: \'4\' num5: \'5\' num6: \'6\'',
        resultDetails: 'num1: false\nnum2: false\nnum3: false\nnum4: false\nnum5: true\nnum6: false'
      };
      solution = { value: 'num1: \n - 2\n\nnum2:\n - 3\n - 4\n\nnum3:\n - 6\n\nnum4:\n - 1\n\nnum5:\n - 5\n\nnum6:\n - 2' };

      const result = [{
        label: '- alain@pix.fr : ',
        answer: '1',
        solution: '2',
        emptyOrWrongAnswer: true,
        inputClass: 'correction-qroc-box__input-wrong-answer',
      }, {
        label: '- leonie@pix.fr : ',
        answer: '2',
        solution: '3',
        emptyOrWrongAnswer: true,
        inputClass: 'correction-qroc-box__input-wrong-answer',
      }, {
        label: '- Programme_Pix.pdf : ',
        answer: '3',
        solution: '6',
        emptyOrWrongAnswer: true,
        inputClass: 'correction-qroc-box__input-wrong-answer',
      }, {
        label: '- lucie@pix.fr : ',
        answer: '4',
        solution: '1',
        emptyOrWrongAnswer: true,
        inputClass: 'correction-qroc-box__input-wrong-answer',
      }, {
        label: '- Programme du festival Pix : ',
        answer: '5',
        solution: '5',
        emptyOrWrongAnswer: false,
        inputClass: 'correction-qroc-box__input-right-answer',
      }, {
        label: '- jeremy@pix.fr : ',
        answer: '6',
        solution: '2',
        emptyOrWrongAnswer: true,
        inputClass: 'correction-qroc-box__input-wrong-answer',
      }];

      // when
      const inputFields = _getComponentInputFields(this);

      // then
      expect(inputFields).to.be.deep.equal(result);
    });

    it('should return an array with data to display (proposals are questions)', function() {
      // given
      challenge = { proposals: '- Combien le dossier "projet PIX" contient-il de dossiers ? ${Num1}\n\n- Combien le dossier "images" contient-il de fichiers ? ${Num2}' };
      answer = { value: 'Num1: \'2\' Num2: \'3\'', resultDetails: 'Num1: false\nNum2: false' };
      solution = { value: 'Num1:\n - 1\n\nNum2:\n - 6' };

      const result = [{
        label: '- Combien le dossier "projet PIX" contient-il de dossiers ? ',
        answer: '2',
        solution: '1',
        emptyOrWrongAnswer: true,
        inputClass: 'correction-qroc-box__input-wrong-answer',
      }, {
        label: '- Combien le dossier "images" contient-il de fichiers ? ',
        answer: '3',
        solution: '6',
        emptyOrWrongAnswer: true,
        inputClass: 'correction-qroc-box__input-wrong-answer',
      }];

      // when
      const inputFields = _getComponentInputFields(this);

      // then
      expect(inputFields).to.be.deep.equal(result);
    });

    it('it should return "Pas de réponse" in each answer if the question was passed', function() {
      // given
      challenge = { proposals: 'Clé USB : ${num1}\n\nCarte mémoire (SD) : ${num2}' };
      answer = { value: '#ABAND#', resultDetails: 'num1: false\nnum2: false' };
      solution = { value: 'num1: \n - 2\n\nnum2:\n - 1' };

      const result = [{
        label: 'Clé USB : ',
        answer: 'Pas de réponse',
        solution: '2',
        emptyOrWrongAnswer: true,
        inputClass: 'correction-qroc-box__input-no-answer',
      }, {
        label: 'Carte mémoire (SD) : ',
        answer: 'Pas de réponse',
        solution: '1',
        emptyOrWrongAnswer: true,
        inputClass: 'correction-qroc-box__input-no-answer',
      }];

      // when
      const inputFields = _getComponentInputFields(this);

      // then
      expect(inputFields).to.be.deep.equal(result);
    });

    /**
     * _inputClass
     */

    it('should return "correction-qroc-box__input-right-answer" CSS class when answer is right', function() {
      // given
      challenge = { proposals: 'Clé USB : ${num1}' };
      answer = { value: 'num1: \'2\'', resultDetails: 'num1: true' };
      solution = { value: 'num1: \n - 2' };

      const result = [{
        label: 'Clé USB : ',
        answer: '2',
        solution: '2',
        emptyOrWrongAnswer: false,
        inputClass: 'correction-qroc-box__input-right-answer'
      }];

      // when
      const inputFields = _getComponentInputFields(this);

      // then
      expect(inputFields).to.be.deep.equal(result);
    });

  });

});
