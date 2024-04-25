import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
// eslint-disable-next-line no-restricted-imports
import { find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { pshuffle } from 'mon-pix/utils/pshuffle';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const assessmentId = 64;
const assessment = {
  get(key) {
    if (key === 'id') {
      return assessmentId;
    }
  },
};
let challenge = null;
let answer = null;
let solution = null;

module('Integration | Component | qcm-solution-panel.js', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Should show the answers', function (hooks) {
    const correctAnswer = {
      id: 'answer_id',
      assessment,
      challenge,
      value: '2,4',
      result: 'ok',
    };

    const unCorrectAnswer = {
      id: 'answer_id',
      assessment,
      challenge,
      value: '1,4',
      result: 'ko',
    };

    hooks.before(function () {
      challenge = EmberObject.create({
        id: 'challenge_id',
        proposals: '-*possibilite* 1\n-[possibilite 2](/test)\n- ![possibilite 3](/images/pix-logo-blanc.svg)\n- yon',
        type: 'QCM',
        shuffled: false,
      });

      solution = '2,3';

      answer = EmberObject.create(correctAnswer);
    });

    module('when user has not answerd correctly', function () {
      module('when solutionToDisplay is indicated', function () {
        test('should show the solution text', async function (assert) {
          // Given
          answer = EmberObject.create(unCorrectAnswer);
          const solutionToDisplay = 'La bonne réponse est TADA !';
          this.set('answer', answer);
          this.set('solution', solution);
          this.set('solutionToDisplay', solutionToDisplay);
          this.set('challenge', challenge);

          // When
          await render(
            hbs`<SolutionPanel::QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`,
          );

          // Then
          assert.dom('.comparison-window-solution').exists();
          assert.ok(find('.comparison-window-solution__text').textContent.includes(solutionToDisplay));
        });
      });

      module('when solutionToDisplay is not indicated', function () {
        test('should not show the solution text', async function (assert) {
          // Given
          answer = EmberObject.create(unCorrectAnswer);
          const solutionToDisplay = null;
          this.set('answer', answer);
          this.set('solution', solution);
          this.set('solutionToDisplay', solutionToDisplay);
          this.set('challenge', challenge);

          // When
          await render(
            hbs`<SolutionPanel::QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`,
          );

          // Then
          assert.dom('.comparison-window-solution').doesNotExist();
        });
      });
    });

    module('when user has answerd correctly', function () {
      module('when solutionToDisplay is indicated', function () {
        test('should not show the solution text', async function (assert) {
          // Given
          answer = EmberObject.create(correctAnswer);
          const solutionToDisplay = 'La bonne réponse est TADA !';
          this.set('answer', answer);
          this.set('solution', solution);
          this.set('solutionToDisplay', solutionToDisplay);
          this.set('challenge', challenge);

          // When
          await render(
            hbs`<SolutionPanel::QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`,
          );

          // Then
          assert.dom('.comparison-window-solution').doesNotExist();
        });
      });
    });

    test('should display the correct answer as ticked', async function (assert) {
      // Given
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<SolutionPanel::QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`,
      );

      // Then
      const labels = findAll('.qcm-proposal-label__answer-details');
      assert.strictEqual(labels[1].getAttribute('data-checked'), 'yes');
      assert.strictEqual(findAll('input[type=checkbox]')[1].getAttribute('disabled'), 'disabled');
      assert.strictEqual(labels[1].getAttribute('data-goodness'), 'good');
      assert.strictEqual(
        labels[1].innerHTML.trim(),
        '<p><a href="/test" rel="noopener noreferrer" target="_blank">possibilite 2</a></p>',
      );
    });

    test('should display an incorrect answer as not ticked', async function (assert) {
      //Given
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<SolutionPanel::QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`,
      );

      // Then
      const labels = findAll('.qcm-proposal-label__answer-details');

      assert.strictEqual(labels[0].getAttribute('data-checked'), 'no');
      assert.strictEqual(labels[0].getAttribute('data-goodness'), 'bad');
      assert.strictEqual(labels[0].innerHTML.trim(), '<p><em>possibilite</em> 1</p>');
    });

    test('should display at least one of the correct answers as not ticked', async function (assert) {
      //Given
      answer = EmberObject.create(unCorrectAnswer);

      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<SolutionPanel::QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`,
      );

      // Then
      const labels = findAll('.qcm-proposal-label__answer-details');

      assert.strictEqual(labels[2].getAttribute('data-checked'), 'no');
      assert.strictEqual(labels[2].getAttribute('data-goodness'), 'good');
      assert.strictEqual(
        labels[2].innerHTML.trim(),
        '<p><img src="/images/pix-logo-blanc.svg" alt="possibilite 3"></p>',
      );
    });

    test('should display at least one of the incorrect answers as ticked', async function (assert) {
      //Given
      answer = EmberObject.create(unCorrectAnswer);

      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<SolutionPanel::QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`,
      );

      // Then
      const labels = findAll('.qcm-proposal-label__answer-details');

      assert.strictEqual(labels[0].getAttribute('data-checked'), 'yes');
      assert.strictEqual(labels[0].getAttribute('data-goodness'), 'bad');
    });

    test('should display no clickable input', async function (assert) {
      //Given
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);

      // When
      await render(
        hbs`<SolutionPanel::QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`,
      );

      // Then
      assert.strictEqual(findAll('.qcm-panel__proposal-checkbox')[0].getAttribute('disabled'), 'disabled');
      assert.strictEqual(findAll('.qcm-panel__proposal-checkbox')[1].getAttribute('disabled'), 'disabled');
      assert.strictEqual(findAll('.qcm-panel__proposal-checkbox')[2].getAttribute('disabled'), 'disabled');
      assert.strictEqual(findAll('.qcm-panel__proposal-checkbox')[3].getAttribute('disabled'), 'disabled');
    });

    module('when proposals are shuffled', function () {
      test('should shuffle the answers', async function (assert) {
        // Given
        answer = EmberObject.create(correctAnswer);
        challenge.shuffled = true;
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        const expectedAnswers = ['possibilite 1', 'possibilite 2', '', 'yon'];

        pshuffle(expectedAnswers, assessmentId);

        // When
        await render(
          hbs`<SolutionPanel::QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`,
        );

        // Then
        const actualAnswers = findAll('.qcm-panel__proposal-item');
        assert.strictEqual(actualAnswers[0].textContent.trim(), expectedAnswers[0]);
        assert.strictEqual(actualAnswers[1].textContent.trim(), expectedAnswers[1]);
        assert.strictEqual(actualAnswers[2].textContent.trim(), expectedAnswers[2]);
      });
    });
  });
});
