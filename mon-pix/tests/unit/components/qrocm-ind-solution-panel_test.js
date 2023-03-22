import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';

module('Unit | Component | qrocm-ind-solution-panel', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#blocks', function (hooks) {
    let challenge;
    let answer;
    let solution;

    hooks.beforeEach(function () {
      challenge = {};
      answer = {};
      solution = '';
    });

    test('should return an array with data to display (case when the answers are right)', function (assert) {
      //Given
      challenge = EmberObject.create({ proposals: 'content : ${smiley1}\n\ntriste : ${smiley2}' });
      answer = { value: "smiley1: ':)' smiley2: ':('", resultDetails: 'smiley1: true\nsmiley2: true' };
      solution = 'smiley1: \n - :-)\n - :)\n - :-D\n - :D\n - :))\n\nsmiley2:\n - :-(\n - :(\n - :((';

      const expectedBlocksData = [
        {
          input: 'smiley1',
          text: 'content : ',
          ariaLabel: null,
          showText: false,
          inputClass: 'correction-qroc-box-answer--correct',
          answer: ':)',
          solution: ':-)',
          emptyOrWrongAnswer: false,
          placeholder: null,
          autoAriaLabel: false,
          type: 'input',
          defaultValue: null,
        },
        {
          input: 'smiley2',
          text: '<br/><br/>triste : ',
          ariaLabel: null,
          showText: false,
          inputClass: 'correction-qroc-box-answer--correct',
          answer: ':(',
          solution: ':-(',
          emptyOrWrongAnswer: false,
          autoAriaLabel: false,
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
      ];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      assert.deepEqual(component.blocks, expectedBlocksData);
    });

    test('should return an array with data to display (case when there is wrong answers)', function (assert) {
      //Given
      challenge = EmberObject.create({ proposals: 'Clé USB : ${num1}\n\nCarte mémoire (SD) : ${num2}' });
      answer = { value: "num1: '1' num2: '2'", resultDetails: 'num1: false\nnum2: false' };
      solution = 'num1: \n - 2\n\nnum2:\n - 1';
      const result = [
        {
          input: 'num1',
          text: 'Clé USB : ',
          ariaLabel: null,
          showText: false,
          inputClass: 'correction-qroc-box-answer--wrong',
          answer: '1',
          solution: '2',
          emptyOrWrongAnswer: true,
          autoAriaLabel: false,
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
        {
          input: 'num2',
          text: '<br/><br/>Carte mémoire (SD) : ',
          ariaLabel: null,
          showText: false,
          inputClass: 'correction-qroc-box-answer--wrong',
          answer: '2',
          solution: '1',
          emptyOrWrongAnswer: true,
          autoAriaLabel: false,
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
      ];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      assert.deepEqual(component.blocks, result);
    });

    test('should return an array with data to display (case when there is some empty answer)', function (assert) {
      //Given
      challenge = EmberObject.create({ proposals: 'Clé USB : ${num1}\n\nCarte mémoire (SD) : ${num2}' });
      answer = { value: "num1: '' num2: '2'", resultDetails: 'num1: false\nnum2: false' };
      solution = 'num1: \n - 2\n\nnum2:\n - 1';

      const result = [
        {
          input: 'num1',
          text: 'Clé USB : ',
          ariaLabel: null,
          showText: false,
          inputClass: 'correction-qroc-box-answer--aband',
          answer: 'Pas de réponse',
          solution: '2',
          emptyOrWrongAnswer: true,
          autoAriaLabel: false,
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
        {
          input: 'num2',
          text: '<br/><br/>Carte mémoire (SD) : ',
          ariaLabel: null,
          showText: false,
          inputClass: 'correction-qroc-box-answer--wrong',
          answer: '2',
          solution: '1',
          emptyOrWrongAnswer: true,
          autoAriaLabel: false,
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
      ];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      assert.deepEqual(component.blocks, result);
    });

    test('should return an array with data to display (proposals contains a dash ("-"))', function (assert) {
      // given
      challenge = EmberObject.create({ proposals: '- alain@pix.fr : ${num1}\n\n- leonie@pix.fr : ${num2}' });
      answer = {
        value: "num1: '1' num2: '2'",
        resultDetails: 'num1: false\nnum2: false',
      };
      solution = 'num1: \n - 2\n\nnum2:\n - 3';

      const result = [
        {
          input: 'num1',
          text: '<br/>- alain@pix.fr : ',
          ariaLabel: null,
          showText: false,
          inputClass: 'correction-qroc-box-answer--wrong',
          answer: '1',
          solution: '2',
          emptyOrWrongAnswer: true,
          autoAriaLabel: false,
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
        {
          input: 'num2',
          text: '<br/><br/>- leonie@pix.fr : ',
          ariaLabel: null,
          showText: false,
          inputClass: 'correction-qroc-box-answer--wrong',
          answer: '2',
          solution: '3',
          emptyOrWrongAnswer: true,
          autoAriaLabel: false,
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
      ];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      assert.deepEqual(component.blocks, result);
    });

    test('should return an array with data to display (proposals are questions)', function (assert) {
      // given
      challenge = EmberObject.create({
        proposals:
          '- Combien le dossier "projet PIX" contient-il de dossiers ? ${Num1}\n\n- Combien le dossier "images" contient-il de fichiers ? ${Num2}',
      });
      answer = { value: "Num1: '2' Num2: '3'", resultDetails: 'Num1: false\nNum2: false' };
      solution = 'Num1:\n - 1\n\nNum2:\n - 6';

      const result = [
        {
          input: 'Num1',
          text: '<br/>- Combien le dossier "projet PIX" contient-il de dossiers ? ',
          ariaLabel: null,
          showText: false,
          inputClass: 'correction-qroc-box-answer--wrong',
          answer: '2',
          solution: '1',
          emptyOrWrongAnswer: true,
          autoAriaLabel: false,
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
        {
          input: 'Num2',
          text: '<br/><br/>- Combien le dossier "images" contient-il de fichiers ? ',
          ariaLabel: null,
          showText: false,
          inputClass: 'correction-qroc-box-answer--wrong',
          answer: '3',
          solution: '6',
          emptyOrWrongAnswer: true,
          autoAriaLabel: false,
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
      ];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      assert.deepEqual(component.blocks, result);
    });

    test('it should return "Pas de réponse" in each answer if the question was passed', function (assert) {
      // given
      challenge = EmberObject.create({ proposals: 'Clé USB : ${num1}\n\nCarte mémoire (SD) : ${num2}' });
      answer = { value: '#ABAND#', resultDetails: 'num1: false\nnum2: false' };
      solution = 'num1: \n - 2\n\nnum2:\n - 1';

      const result = [
        {
          input: 'num1',
          text: 'Clé USB : ',
          ariaLabel: null,
          showText: false,
          inputClass: 'correction-qroc-box-answer--aband',
          answer: 'Pas de réponse',
          solution: '2',
          emptyOrWrongAnswer: true,
          autoAriaLabel: false,
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
        {
          input: 'num2',
          text: '<br/><br/>Carte mémoire (SD) : ',
          ariaLabel: null,
          showText: false,
          inputClass: 'correction-qroc-box-answer--aband',
          answer: 'Pas de réponse',
          solution: '1',
          emptyOrWrongAnswer: true,
          autoAriaLabel: false,
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
      ];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      assert.deepEqual(component.blocks, result);
    });

    /**
     * _inputClass
     */

    test('should return "correction-qroc-box-answer--correct" CSS class when answer is right', function (assert) {
      // given
      challenge = EmberObject.create({ proposals: 'Clé USB : ${num1}' });
      answer = { value: "num1: '2'", resultDetails: 'num1: true' };
      solution = 'num1: \n - 2';

      const result = [
        {
          input: 'num1',
          text: 'Clé USB : ',
          ariaLabel: null,
          type: 'input',
          defaultValue: null,
          showText: false,
          inputClass: 'correction-qroc-box-answer--correct',
          answer: '2',
          solution: '2',
          emptyOrWrongAnswer: false,
          autoAriaLabel: false,
          placeholder: null,
        },
      ];

      //When
      const component = createGlimmerComponent('component:qrocm-ind-solution-panel', {
        challenge,
        answer,
        solution,
      });

      //Then
      assert.deepEqual(component.blocks, result);
    });
  });
});
