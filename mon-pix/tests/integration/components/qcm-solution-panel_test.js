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

module('Integration | Component | qcm-solution-panel.js', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#Component should renders: ', function () {
    test('Should renders', async function (assert) {
      await render(hbs`<QcmSolutionPanel />`);

      assert.dom(find('.qcm-solution-panel')).exists();
      assert.equal(findAll('.qcm-proposal-label__answer-details'), 0);
    });

    module('Should show the answers', function () {
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

      before(function () {
        challenge = EmberObject.create({
          id: 'challenge_id',
          proposals: '-*possibilite* 1\n-[possibilite 2](/test)\n- ![possibilite 3](/images/pix-logo-blanc.svg)\n- yon',
          type: 'QCM',
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
              hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
            );

            // Then
            assert.dom(find('.comparison-window-solution')).exists();
            assert.dom(find('.comparison-window-solution__text').textContent).hasText(solutionToDisplay);
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
              hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
            );

            // Then
            assert.dom(find('.comparison-window-solution')).doesNotExist();
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
              hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`
            );

            // Then
            assert.dom(find('.comparison-window-solution')).doesNotExist();
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
          hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`
        );

        // Then
        const labels = findAll('.qcm-proposal-label__answer-details');
        assert.equal(labels[1].getAttribute('data-checked'), 'yes');
        assert.equal(findAll('input[type=checkbox]')[1].getAttribute('disabled'), 'disabled');
        assert.equal(labels[1].getAttribute('data-goodness'), 'good');
        assert.equal(
          labels[1].innerHTML.trim(),
          '<p><a href="/test" rel="noopener noreferrer" target="_blank">possibilite 2</a></p>'
        );
      });

      test('should display an incorrect answer as not ticked', async function (assert) {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(
          hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`
        );

        // Then
        const labels = findAll('.qcm-proposal-label__answer-details');

        assert.equal(labels[0].getAttribute('data-checked'), 'no');
        assert.equal(labels[0].getAttribute('data-goodness'), 'bad');
        assert.equal(labels[0].innerHTML.trim(), '<p><em>possibilite</em> 1</p>');
      });

      test('should display at least one of the correct answers as not ticked', async function (assert) {
        //Given
        answer = EmberObject.create(unCorrectAnswer);

        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(
          hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`
        );

        // Then
        const labels = findAll('.qcm-proposal-label__answer-details');

        assert.equal(labels[2].getAttribute('data-checked'), 'no');
        assert.equal(labels[2].getAttribute('data-goodness'), 'good');
        assert.equal(labels[2].innerHTML.trim(), '<p><img src="/images/pix-logo-blanc.svg" alt="possibilite 3"></p>');
      });

      test('should display at least one of the incorrect answers as ticked', async function (assert) {
        //Given
        answer = EmberObject.create(unCorrectAnswer);

        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(
          hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`
        );

        // Then
        const labels = findAll('.qcm-proposal-label__answer-details');

        assert.equal(labels[0].getAttribute('data-checked'), 'yes');
        assert.equal(labels[0].getAttribute('data-goodness'), 'bad');
      });

      test('should display no clickable input', async function (assert) {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(
          hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`
        );

        // Then
        const size = findAll('.comparison-window .qcm-proposal-label__checkbox-picture').length;
        times(size, function (index) {
          assert.equal(
            find('.comparison-window .qcm-proposal-label__checkbox-picture:eq(' + index + ')').getAttribute('disabled'),
            'disabled'
          );
        });
      });
    });
  });
});
