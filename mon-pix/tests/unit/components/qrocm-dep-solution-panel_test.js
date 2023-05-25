import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';

module('Unit | Component | qrocm-dep-solution-panel', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#blocks', function () {
    test('should return an array with data to display', function (assert) {
      //Given
      const challenge = EmberObject.create({ proposals: 'content : ${smiley1}\n\ntriste : ${smiley2}' });
      const answer = {
        value: "smiley1: ':)' smiley2: ''",
        result: 'ko',
      };
      const correctionBlocks = [{ validated: true }, { validated: false }];

      const component = createGlimmerComponent('qrocm-dep-solution-panel', { challenge, answer, correctionBlocks });

      const expectedBlocksData = [
        {
          input: 'smiley1',
          text: 'content : ',
          ariaLabel: null,
          autoAriaLabel: false,
          inputClass: 'correction-qroc-box-answer--correct',
          answer: ':)',
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
        {
          input: 'smiley2',
          text: '<br/><br/>triste : ',
          ariaLabel: null,
          autoAriaLabel: false,
          inputClass: 'correction-qroc-box-answer--aband',
          answer: 'Pas de réponse',
          placeholder: null,
          type: 'input',
          defaultValue: null,
        },
      ];

      //when
      const blocks = component.blocks;

      //Then
      assert.deepEqual(blocks, expectedBlocksData);
    });
  });

  module('#getInputClass', function () {
    test('should return "aband" css class when isAnswerEmpty param is true', function (assert) {
      //Given
      const component = createGlimmerComponent('qrocm-dep-solution-panel', { answer: { result: 'ok' } });

      //when
      const inputClass = component.getInputClass(true);

      //Then
      assert.deepEqual(inputClass, 'correction-qroc-box-answer--aband');
    });

    test('should return "correct" css class when isAnswerEmpty param is false and isCorrectAnswer is true', function (assert) {
      //Given
      const component = createGlimmerComponent('qrocm-dep-solution-panel', { answer: { result: 'ok' } });

      //when
      const inputClass = component.getInputClass(false, true);

      //Then
      assert.deepEqual(inputClass, 'correction-qroc-box-answer--correct');
    });

    test('should return "wrong" css class when isAnswerEmpty param is false and isCorrectAnswer is false', function (assert) {
      //Given
      const component = createGlimmerComponent('qrocm-dep-solution-panel', { answer: { result: 'ok' } });

      //when
      const inputClass = component.getInputClass(false, false);

      //Then
      assert.deepEqual(inputClass, 'correction-qroc-box-answer--wrong');
    });
  });

  module('#answerIsCorrect', function () {
    test('should return true', function (assert) {
      //Given
      const component = createGlimmerComponent('qrocm-dep-solution-panel', { answer: { result: 'ok' } });

      //when
      const answerIsCorrect = component.answerIsCorrect;

      //Then
      assert.true(answerIsCorrect);
    });

    test('should return false', function (assert) {
      //Given
      const component = createGlimmerComponent('qrocm-dep-solution-panel', { answer: { result: 'ko' } });

      //when
      const answerIsCorrect = component.answerIsCorrect;

      //Then
      assert.false(answerIsCorrect);
    });
  });

  module('#understandableSolution', function () {
    test('should return the expected answers', function (assert) {
      //Given
      const challenge = EmberObject.create({ proposals: 'content : ${smiley1}\n\ntriste : ${smiley2}' });
      const component = createGlimmerComponent('qrocm-dep-solution-panel', {
        challenge,
        answer: { result: 'ko' },
        solution: 'groupe 1:\n- horizontalité\n- organisation plate\ngroupe 2:\n- cadre',
      });

      //when
      const understandableSolution = component.understandableSolution;

      //Then
      assert.strictEqual(understandableSolution, 'horizontalité et cadre');
    });

    test('should return examples of good answers', function (assert) {
      //Given
      const challenge = EmberObject.create({ proposals: 'content : ${smiley1}\n\ntriste : ${smiley2}' });
      const component = createGlimmerComponent('qrocm-dep-solution-panel', {
        challenge,
        answer: { result: 'ko' },
        solution: 'groupe 1:\n- tag\n- slogan\ngroupe 2:\n- marche\n- sitting\ngroupe 3:\n- masque',
      });

      //when
      const understandableSolution = component.understandableSolution;

      //Then
      assert.strictEqual(understandableSolution, 'tag ou marche ou ...');
    });
  });
});
