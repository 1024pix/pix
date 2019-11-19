import EmberObject from '@ember/object';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const ANSWER_BLOCK = '.correction-qroc-box__answer';
const ANSWER_INPUT = '.correction-qroc-box-answer';
const SOLUTION_BLOCK = '.correction-qroc-box__solution';

const CARIBBEAN_GREEN_COLOR = 'rgb(19, 201, 160)';

describe('Integration | Component | qroc solution panel', function() {

  setupRenderingTest();

  describe('When format is paragraph', function() {
    it('should display disabled textarea', async function() {
      // given
      const challenge = EmberObject.create({ format: 'paragraphe' });
      const answer = EmberObject.create({ challenge });
      this.set('answer', answer);

      //when
      await render(hbs`{{qroc-solution-panel answer=answer}}`);

      // then
      expect(find('input')).to.not.exist;
      expect(find('textarea.correction-qroc-box-answer--textarea')).to.have.attr('disabled');
      expect(find('.correction-qroc-box-answer').getAttribute('rows')).to.equal('5');
    });
  });

  describe('When format is not a paragraph', function() {
    [
      { format: 'petit', expectedSize: '11' },
      { format: 'mots', expectedSize: '20' },
      { format: 'phrase', expectedSize: '50' },
      { format: 'unreferenced_format', expectedSize: '20' }
    ].forEach((data) => {
      it(`should display a disabled input with expected size (${data.expectedSize}) when format is ${data.format}`, async function() {
        // given
        const challenge = EmberObject.create({ format: data.format });
        const answer = EmberObject.create({ challenge });
        this.set('answer', answer);
        await render(hbs`{{qroc-solution-panel answer=answer}}`);

        //when
        await render(hbs`{{qroc-solution-panel answer=answer}}`);

        // then
        expect(find('textarea.correction-qroc-box-answer--textarea')).to.not.exist;
        expect(find('input.correction-qroc-box-answer')).to.have.attr('disabled');
        expect(find('input.correction-qroc-box-answer').getAttribute('size')).to.equal(data.expectedSize);
      });
    });
  });

  [
    { format: 'petit' },
    { format: 'unreferenced_format' },
    { format: 'paragraphe' },
  ].forEach((data) => {

    describe('Whatever the format', function() {
      describe('comparison when the answer is right', function() {

        const assessment = EmberObject.create({ id: 'assessment_id' });
        const challenge = EmberObject.create({ id: 'challenge_id', format: data.format });
        const answer = EmberObject.create({ id: 'answer_id', result: 'ok', assessment, challenge });

        it('should display the answer in bold green and not the solution', async function() {
          // given
          const boldFontWeight = 700;
          this.set('answer', answer);
          await render(hbs`{{qroc-solution-panel answer=answer}}`);

          // when
          const answerInput = find(ANSWER_INPUT);
          const answerBlock = find(ANSWER_BLOCK);
          const solutionBlock = find(SOLUTION_BLOCK);
          const answerInputStyles = window.getComputedStyle(answerInput);

          // then
          expect(answerInput).to.exist;
          expect(answerBlock).to.exist;
          expect(solutionBlock).to.not.exist;
          expect(answerInputStyles.getPropertyValue('text-decoration')).to.include('none');
          expect(answerInputStyles.getPropertyValue('color')).to.equal(CARIBBEAN_GREEN_COLOR);
          expect(answerInputStyles.getPropertyValue('font-weight')).to.include(boldFontWeight);
        });
      });

      describe('comparison when the answer is false', function() {

        beforeEach(async function() {
          const assessment = EmberObject.create({ id: 'assessment_id' });
          const challenge = EmberObject.create({ id: 'challenge_id', format: data.format });
          const answer = EmberObject.create({ id: 'answer_id', result: 'ko', assessment, challenge });

          this.set('answer', answer);
          await render(hbs`{{qroc-solution-panel answer=answer}}`);
        });

        it('should display the false answer line-through', function() {
          // given
          const answerBlock = find(ANSWER_BLOCK);
          const answerInput = find(ANSWER_INPUT);

          // then
          const answerInputStyles = window.getComputedStyle(answerInput);
          expect(answerBlock).to.exist;
          expect(answerInputStyles.getPropertyValue('text-decoration')).to.include('line-through');
        });

        it('should display the solution with an arrow and the solution in bold green', function() {
          // given
          const blockSolution = find(SOLUTION_BLOCK);

          // then
          const blockSolutionStyles = window.getComputedStyle(blockSolution);
          const arrowImg = find('.correction-qroc-box__solution-img');
          const solutionTextStyles = window.getComputedStyle(find('.correction-qroc-box__solution-text'));
          expect(blockSolution).to.exist;
          expect(arrowImg).to.exist;
          expect(solutionTextStyles.getPropertyValue('color')).to.equal(CARIBBEAN_GREEN_COLOR);
          expect(blockSolutionStyles.getPropertyValue('align-items')).to.equal('stretch');
        });
      });

      describe('comparison when the answer was not given', function() {

        beforeEach(function() {
          const assessment = EmberObject.create({ id: 'assessment_id' });
          const challenge = EmberObject.create({ id: 'challenge_id', format: data.format });
          const answer = EmberObject.create({ id: 'answer_id', value: '#ABAND#', assessment, challenge });

          this.set('answer', answer);
          this.set('isResultWithoutAnswer', true);
        });

        //BUG car normal au lieu de italic
        it('BUG: should display "Pas de réponse" in italic', async function() {
          // given
          const emptyDefaultMessage = 'Pas de réponse';

          // when
          await render(hbs`{{qroc-solution-panel answer=answer}}`);
          const answerBlock = find('.correction-qroc-box-answer');
          const answerBlockStyle = window.getComputedStyle(answerBlock);

          // then
          expect(answerBlock).to.exist;
          expect(answerBlock.value).to.equal(emptyDefaultMessage);
          expect(answerBlockStyle.getPropertyValue('font-style')).to.equal('normal');
        });
      });
    });
  });

});
