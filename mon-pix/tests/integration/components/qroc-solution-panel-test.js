import EmberObject from '@ember/object';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QROC solution panel', function() {

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
      expect(find('textarea.correction-qroc-box-answer--paragraph')).to.have.attr('disabled');
      expect(find('.correction-qroc-box-answer').getAttribute('rows')).to.equal('5');
    });
  });

  describe('When format is sentence', function() {
    it('should display disabled input', async function() {
      // given
      const challenge = EmberObject.create({ format: 'phrase' });
      const answer = EmberObject.create({ challenge });
      this.set('answer', answer);

      //when
      await render(hbs`{{qroc-solution-panel answer=answer}}`);

      // then
      expect(find('input.correction-qroc-box-answer--sentence')).to.have.attr('disabled');
    });
  });

  describe('When format is neither a paragraph nor a sentence', function() {
    [
      { format: 'petit', expectedSize: '11' },
      { format: 'mots', expectedSize: '20' },
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
        expect(find('textarea.correction-qroc-box-answer--paragraph')).to.not.exist;
        expect(find('textarea.correction-qroc-box-answer--sentence')).to.not.exist;
        expect(find('input.correction-qroc-box-answer')).to.have.attr('disabled');
        expect(find('input.correction-qroc-box-answer').getAttribute('size')).to.equal(data.expectedSize);
      });
    });
  });

  [
    { format: 'petit' },
    { format: 'phrase' },
    { format: 'paragraphe' },
    { format: 'unreferenced_format' },
  ].forEach((data) => {
    describe(`Whatever the format (testing "${data.format}" format)`, function() {
      describe('When the answer is correct', function() {

        beforeEach(async function() {
          // given
          const assessment = EmberObject.create({ id: 'assessment_id' });
          const challenge = EmberObject.create({ id: 'challenge_id', format: data.format });
          const answer = EmberObject.create({ id: 'answer_id', result: 'ok', assessment, challenge });

          // when
          await render(hbs`{{qroc-solution-panel answer=answer}}`);
          this.set('answer', answer);
        });

        it('should display the answer in bold green', async function() {
          // then
          expect(find('.correction-qroc-box-answer')).to.exist;
          expect(find('.correction-qroc-box__answer')).to.exist;
          expect(find('.correction-qroc-box-answer--correct')).to.exist;
        });

        it('should not display the solution', async function() {
          // then
          expect(find('.correction-qroc-box__solution')).to.not.exist;
        });
      });

      describe('When the answer is wrong', function() {

        beforeEach(async function() {
          // given
          const assessment = EmberObject.create({ id: 'assessment_id' });
          const challenge = EmberObject.create({ id: 'challenge_id', format: data.format });
          const answer = EmberObject.create({ id: 'answer_id', result: 'ko', assessment, challenge });

          // when
          this.set('answer', answer);
          await render(hbs`{{qroc-solution-panel answer=answer}}`);
        });

        it('should display the false answer with line-through', function() {
          // then
          expect(find('.correction-qroc-box-answer')).to.exist;
          expect(find('.correction-qroc-box__answer')).to.exist;
          expect(find('.correction-qroc-box-answer--wrong')).to.exist;
        });

        it('should display the solution with an arrow and the solution in bold green', function() {
          const blockSolution = find('.correction-qroc-box__solution');
          const arrowImg = find('.correction-qroc-box__solution-img');
          const solutionText = find('.correction-qroc-box__solution-text');

          // then
          expect(blockSolution).to.exist;
          expect(arrowImg).to.exist;
          expect(solutionText).to.exist;
        });
      });

      describe('When the answer was not given', function() {

        const EMPTY_DEFAULT_MESSAGE = 'Pas de réponse';

        beforeEach(async function() {
          // given
          const assessment = EmberObject.create({ id: 'assessment_id' });
          const challenge = EmberObject.create({ id: 'challenge_id', format: data.format });
          const answer = EmberObject.create({ id: 'answer_id', value: '#ABAND#', result: 'aband', assessment, challenge });

          // when
          this.set('answer', answer);
          this.set('isResultWithoutAnswer', true);

          await render(hbs`{{qroc-solution-panel answer=answer}}`);
        });

        it('should display "Pas de réponse" in italic', function() {
          // then
          const answerBlock = find('.correction-qroc-box-answer');

          expect(answerBlock).to.exist;
          expect(answerBlock.value).to.equal(EMPTY_DEFAULT_MESSAGE);
          expect(find('.correction-qroc-box-answer--aband')).to.exist;
        });
      });
    });
  });

});
