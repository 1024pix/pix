import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, before } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import times from 'lodash/times';

const assessment = {};
let challenge = null;
let answer = null;
let solution = null;

describe('Integration | Component | qcm-solution-panel.js', function() {

  setupIntlRenderingTest();

  describe('#Component should renders: ', function() {

    it('Should renders', async function() {
      await render(hbs`<QcmSolutionPanel />`);

      expect(find('.qcm-solution-panel')).to.exist;
      expect(findAll('.qcm-proposal-label__answer-details')).to.have.lengthOf(0);
    });

    describe('Should show the answers', function() {
      const correctAnswer = {
        id: 'answer_id', assessment, challenge, value: '2,4', result: 'ok',
      };

      const unCorrectAnswer = {
        id: 'answer_id', assessment, challenge, value: '1,4', result: 'ko',
      };

      before(function() {
        challenge = EmberObject.create({
          id: 'challenge_id',
          proposals: '-*possibilite* 1\n-[possibilite 2](/test)\n- ![possibilite 3](/images/pix-logo-blanc.svg)\n- yon',
          type: 'QCM',
        });

        solution = '2,3';

        answer = EmberObject.create(correctAnswer);
      });

      context('when user has not answerd correctly', function() {

        context('when solutionToDisplay is indicated', function() {
          it('should show the solution text', async function() {
            // Given
            answer = EmberObject.create(unCorrectAnswer);
            const solutionToDisplay = 'La bonne réponse est TADA !';
            this.set('answer', answer);
            this.set('solution', solution);
            this.set('solutionToDisplay', solutionToDisplay);
            this.set('challenge', challenge);

            // When
            await render(hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`);

            // Then
            expect(find('.comparison-window-solution')).to.exist;
            expect(find('.comparison-window-solution__text').textContent).to.contains(solutionToDisplay);
          });
        });

        context('when solutionToDisplay is not indicated', function() {
          it('should not show the solution text', async function() {
            // Given
            answer = EmberObject.create(unCorrectAnswer);
            const solutionToDisplay = null;
            this.set('answer', answer);
            this.set('solution', solution);
            this.set('solutionToDisplay', solutionToDisplay);
            this.set('challenge', challenge);

            // When
            await render(hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`);

            // Then
            expect(find('.comparison-window-solution')).to.not.exist;
          });
        });
      });

      context('when user has answerd correctly', function() {

        context('when solutionToDisplay is indicated', function() {
          it('should not show the solution text', async function() {
            // Given
            answer = EmberObject.create(correctAnswer);
            const solutionToDisplay = 'La bonne réponse est TADA !';
            this.set('answer', answer);
            this.set('solution', solution);
            this.set('solutionToDisplay', solutionToDisplay);
            this.set('challenge', challenge);

            // When
            await render(hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}} @solutionToDisplay={{this.solutionToDisplay}}/>`);

            // Then
            expect(find('.comparison-window-solution')).to.not.exist;
          });
        });
      });

      it('should display the correct answer as ticked', async function() {
        // Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

        // Then
        const labels = findAll('.qcm-proposal-label__answer-details');
        expect(labels[1].getAttribute('data-checked')).to.equal('yes');
        expect(findAll('input[type=checkbox]')[1].getAttribute('disabled')).to.equal('disabled');
        expect(labels[1].getAttribute('data-goodness')).to.equal('good');
        expect(labels[1].innerHTML.trim()).to.equal(
          '<p><a href="/test" rel="noopener noreferrer" target="_blank">possibilite 2</a></p>',
        );
      });

      it('should display an incorrect answer as not ticked', async function() {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

        // Then
        const labels = findAll('.qcm-proposal-label__answer-details');

        expect(labels[0].getAttribute('data-checked')).to.equal('no');
        expect(labels[0].getAttribute('data-goodness')).to.equal('bad');
        expect(labels[0].innerHTML.trim()).to.equal('<p><em>possibilite</em> 1</p>');
      });

      it('should display at least one of the correct answers as not ticked', async function() {
        //Given
        answer = EmberObject.create(unCorrectAnswer);

        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

        // Then
        const labels = findAll('.qcm-proposal-label__answer-details');

        expect(labels[2].getAttribute('data-checked')).to.equal('no');
        expect(labels[2].getAttribute('data-goodness')).to.equal('good');
        expect(labels[2].innerHTML.trim()).to.equal(
          '<p><img src="/images/pix-logo-blanc.svg" alt="possibilite 3"></p>',
        );
      });

      it('should display at least one of the incorrect answers as ticked', async function() {
        //Given
        answer = EmberObject.create(unCorrectAnswer);

        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

        // Then
        const labels = findAll('.qcm-proposal-label__answer-details');

        expect(labels[0].getAttribute('data-checked')).to.equal('yes');
        expect(labels[0].getAttribute('data-goodness')).to.equal('bad');
      });

      it('should display no clickable input', async function() {
        //Given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);

        // When
        await render(hbs`<QcmSolutionPanel @answer={{this.answer}} @challenge={{this.challenge}} @solution={{this.solution}}/>`);

        // Then
        const size = findAll('.comparison-window .qcm-proposal-label__checkbox-picture').length;
        times(size, function(index) {
          expect(find('.comparison-window .qcm-proposal-label__checkbox-picture:eq(' + index + ')').getAttribute('disabled')).to.equal('disabled');
        });
      });
    });
  });
});
