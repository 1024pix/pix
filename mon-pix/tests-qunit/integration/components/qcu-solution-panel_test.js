import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import times from 'lodash/times';

const assessment = {};
let challenge = null;
let answer = null;
let solution = null;
let solutionToDisplay = null;
let solutionAsText = null;

module('Integration | Component | qcu-solution-panel.js', function (hooks) {
  setupIntlRenderingTest(hooks);

  const correctAnswer = {
    id: 'answer_id',
    assessment,
    challenge,
    value: '2',
  };

  const unCorrectAnswer = {
    id: 'answer_id',
    assessment,
    challenge,
    value: '3',
  };

  test('Should render', async function (assert) {
    await render(hbs`<QcuSolutionPanel/>`);
    assert.dom(find('.qcu-solution-panel')).exists();
  });

  module('Radio state', function () {
    before(function () {
      challenge = EmberObject.create({
        id: 'challenge_id',
        proposals: '-foo\n- bar\n- qix\n- yon',
        type: 'QCU',
      });

      solution = '2';

      solutionToDisplay = 'La réponse est 2';

      answer = {
        id: 'answer_id',
        assessment,
        challenge,
        value: '2',
      };
    });

    test('Should display only user answer', async function (assert) {
      // Given
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('solutionToDisplay', null);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
      );

      // Then
      assert.equal(findAll('[data-goodness=good]').length, 1);
    });

    test('should not be editable', async function (assert) {
      //Given
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('solutionToDisplay', null);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
      );

      // Then
      times(findAll('.comparison-window .qcu-solution-panel__radio-button').length, function (index) {
        assert.equal(
          find('.comparison-window .qcu-solution-panel__radio-button:eq(' + index + ')').getAttribute('disabled'),
          'disabled'
        );
      });
    });
  });

  module('When answer is correct', function () {
    before(function () {
      challenge = EmberObject.create({
        id: 'challenge_id',
        proposals: '-foo\n- bar\n- qix\n- yon',
        type: 'QCU',
      });

      solution = '2';
    });

    test('should inform that the answer is correct', async function (assert) {
      //Given
      this.set('answer', correctAnswer);
      this.set('solution', solution);
      this.set('solutionToDisplay', null);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
      );

      // Then
      assert.dom(find('div[data-test-correct-answer]')).exists();
    });
  });

  module('When answer is wrong', function () {
    before(function () {
      challenge = EmberObject.create({
        id: 'challenge_id',
        proposals: '-foo\n- bar\n- qix\n- yon',
        type: 'QCU',
      });

      solution = '2';
      solutionAsText = 'bar';
    });

    test('should inform that the answer is wrong', async function (assert) {
      //Given
      this.set('answer', unCorrectAnswer);
      this.set('solution', solution);
      this.set('solutionToDisplay', null);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
      );

      // Then
      assert.dom(find('.qcu-solution-answer-feedback__expected-answer')).exists();
    });

    test('should inform the user of the correct answer', async function (assert) {
      // Given
      this.set('answer', unCorrectAnswer);
      this.set('solution', solution);
      this.set('solutionToDisplay', null);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
      );

      // Then
      const correctAnswer = find('.qcu-solution-answer-feedback__expected-answer');
      assert.dom(correctAnswer).exists();
      assert.equal(correctAnswer.innerText, 'Réponse incorrecte.\nLa bonne réponse est la réponse : ' + solutionAsText);
    });

    test('should inform the user of the correct answer with solution to display when it is not null', async function (assert) {
      // Given
      this.set('answer', unCorrectAnswer);
      this.set('solution', solution);
      this.set('solutionToDisplay', solutionToDisplay);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
      );

      // Then
      const correctAnswer = find('.qcu-solution-answer-feedback__expected-answer');
      assert.dom(correctAnswer).exists();
      assert.equal(
        correctAnswer.innerText,
        'Réponse incorrecte.\nLa bonne réponse est la réponse : ' + solutionToDisplay
      );
    });
  });

  module('All Radio states', function () {
    before(function () {
      challenge = EmberObject.create({
        id: 'challenge_id',
        proposals: '-foo\n- bar\n- qix\n- yon',
        type: 'QCM',
      });

      solution = '2';

      answer = EmberObject.create(correctAnswer);
    });

    test('QCU, correct answer is checked', async function (assert) {
      //Given
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('solutionToDisplay', null);
      this.set('challenge', challenge);
      // When
      await render(
        hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
      );

      // Then
      assert.equal(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-checked'), 'yes');
      assert.equal(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-goodness'), 'good');
      assert.dom(findAll('.qcu-solution-panel__radio-button')[1].innerHTML).hasText('Votre réponse');
    });

    test('QCU, correct answer is not checked', async function (assert) {
      //Given
      answer = EmberObject.create(unCorrectAnswer);

      this.set('answer', answer);
      this.set('solution', solution);
      this.set('solutionToDisplay', null);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
      );

      // Then
      assert.equal(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-checked'), 'no');
      assert.equal(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-goodness'), 'good');
      assert.dom(findAll('.qcu-solution-panel__radio-button')[1].innerHTML).hasText('Autre proposition');
    });

    test('QCU, incorrect answer is not checked', async function (assert) {
      //Given
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('solutionToDisplay', null);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
      );

      // Then
      assert.equal(findAll('.qcu-solution-panel__proposition')[0].getAttribute('data-checked'), 'no');
      assert.equal(findAll('.qcu-solution-panel__proposition')[0].getAttribute('data-goodness'), 'bad');
      assert.dom(findAll('.qcu-solution-panel__radio-button')[0].innerHTML).hasText('Autre proposition');
    });

    test('QCU, incorrect answer is checked', async function (assert) {
      //Given
      answer = EmberObject.create(unCorrectAnswer);

      this.set('answer', answer);
      this.set('solution', solution);
      this.set('solutionToDisplay', null);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
      );

      // Then
      assert.equal(findAll('.qcu-solution-panel__proposition')[2].getAttribute('data-checked'), 'yes');
      assert.equal(findAll('.qcu-solution-panel__proposition')[2].getAttribute('data-goodness'), 'bad');
      assert.dom(findAll('.qcu-solution-panel__radio-button')[2].innerHTML).hasText('Votre réponse');
    });

    test('Should avoid click on radio button', async function (assert) {
      //Given
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('solutionToDisplay', null);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<QcuSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
      );

      // Then
      times(findAll('.comparison-window .qcu-solution-panel__radio-button').length, function (index) {
        assert.equal(
          find('.comparison-window .qcu-solution-panel__radio-button:eq(' + index + ')').getAttribute('disabled'),
          'disabled'
        );
      });
    });
  });
});
