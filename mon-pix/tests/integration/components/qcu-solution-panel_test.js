import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

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
    this.set('answer', {});

    await render(hbs`<QcuSolutionPanel @answer={{this.answer}}/>`);
    assert.dom('.qcu-solution-panel').exists();
  });

  module('Radio state', function (hooks) {
    hooks.before(function () {
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
      assert.strictEqual(findAll('[data-goodness=good]').length, 1);
    });
  });

  module('When answer is correct', function (hooks) {
    hooks.before(function () {
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
      assert.dom('div[data-test-correct-answer]').exists();
    });
  });

  module('When answer is wrong', function (hooks) {
    hooks.before(function () {
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
      assert.dom('.qcu-solution-answer-feedback__expected-answer').exists();
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
      assert.ok(correctAnswer);
      assert.strictEqual(correctAnswer.innerText, 'Réponse incorrecte.\nLa bonne réponse est : ' + solutionAsText);
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
      assert.ok(correctAnswer);
      assert.strictEqual(correctAnswer.innerText, 'Réponse incorrecte.\nLa bonne réponse est : ' + solutionToDisplay);
    });
  });

  module('All Radio states', function (hooks) {
    hooks.before(function () {
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
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-checked'), 'yes');
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-goodness'), 'good');
      assert.ok(findAll('.qcu-solution-panel__radio-button')[1].innerHTML.includes('Votre réponse'));
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
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-checked'), 'no');
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[1].getAttribute('data-goodness'), 'good');
      assert.ok(findAll('.qcu-solution-panel__radio-button')[1].innerHTML.includes('Autre proposition'));
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
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[0].getAttribute('data-checked'), 'no');
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[0].getAttribute('data-goodness'), 'bad');
      assert.ok(findAll('.qcu-solution-panel__radio-button')[0].innerHTML.includes('Autre proposition'));
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
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[2].getAttribute('data-checked'), 'yes');
      assert.strictEqual(findAll('.qcu-solution-panel__proposition')[2].getAttribute('data-goodness'), 'bad');
      assert.ok(findAll('.qcu-solution-panel__radio-button')[2].innerHTML.includes('Votre réponse'));
    });
  });
});
