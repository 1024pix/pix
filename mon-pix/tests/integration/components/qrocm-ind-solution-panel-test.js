import EmberObject from '@ember/object';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const ANSWER = '.correction-qrocm__answer';
const INPUT = 'input.correction-qrocm__answer--input';
const PARAGRAPH = 'textarea.correction-qrocm__answer--paragraph';
const SENTENCE = 'input.correction-qrocm__answer--sentence';
const SOLUTION_BLOCK = '.correction-qrocm__solution';
const SOLUTION_TEXT = '.correction-qrocm__solution-text';

const NO_ANSWER_POSITION = 0;
const WRONG_ANSWER_POSITION = 1;
const CORRECT_ANSWER_POSITION = 2;

describe('Integration | Component | QROCm ind solution panel', function() {

  setupRenderingTest();

  const assessment = EmberObject.create({ id: 'assessment_id' });
  const challenge = EmberObject.create({
    id: 'challenge_id',
    proposals: 'blabla : ${key1}\nCarte mémoire (SD) : ${key2}\nanswer : ${key3}',
    format: 'petit'
  });
  const answer = EmberObject.create({
    id: 'answer_id',
    value: 'key1: \'\' key2: \'wrongAnswer2\' key3: \'rightAnswer3\'',
    resultDetails: 'key1: false\nkey2: false\nkey3: true',
    assessment,
    challenge
  });
  const solution = 'key1:\n- rightAnswer1\n' +
    'key2:\n- rightAnswer20\n- rightAnswer21\n' +
    'key3 :\n- rightAnswer3' ;

  [
    { format: 'petit' },
    { format: 'phrase' },
    { format: 'paragraphe' },
    { format: 'unreferenced_format' },
  ].forEach((data) => {
    describe(`Whatever the format (testing "${data.format}" format)`, function() {

      beforeEach(async function() {
        // given
        this.set('answer', answer);
        this.set('solution', solution);
        this.set('challenge', challenge);
        this.challenge.set('format', data.format);

        // when
        await render(hbs`{{qrocm-ind-solution-panel answer=answer solution=solution challenge=challenge}}`);
      });

      describe('When the answer is correct', function() {

        it('should display the correct answer in green bold', async function() {
          // then
          const correctAnswerText = findAll(ANSWER)[CORRECT_ANSWER_POSITION];
          expect(correctAnswerText.classList.contains('correction-qroc-box-answer--correct')).to.be.true;
        });

        it('should not display the solution block', async function() {
          // then
          const solutionBlockList = findAll(SOLUTION_BLOCK);
          const correctSolutionBlock = solutionBlockList[CORRECT_ANSWER_POSITION];

          expect(correctSolutionBlock).to.not.exist;
          expect(solutionBlockList).to.have.lengthOf(2);
        });
      });

      describe('When there is no answer', function() {
        const EMPTY_DEFAULT_MESSAGE = 'Pas de réponse';

        it('should display one solution in bold green', async function() {
          // then
          const noAnswerSolutionBlock = findAll(SOLUTION_BLOCK)[NO_ANSWER_POSITION];
          const noAnswerSolutionText = findAll(SOLUTION_TEXT)[NO_ANSWER_POSITION];

          expect(noAnswerSolutionBlock).to.exist;
          expect(noAnswerSolutionText).to.exist;
        });

        it('should display the empty answer with the default message "Pas de réponse" in italic', async function() {
          // then
          const answerInput = findAll(ANSWER)[NO_ANSWER_POSITION];

          expect(answerInput).to.exist;
          expect(answerInput.value).to.equal(EMPTY_DEFAULT_MESSAGE);
          expect(answerInput.classList.contains('correction-qroc-box-answer--aband')).to.be.true;
        });
      });

      describe('When the answer is wrong', function() {
        it('should display one solution in bold green', async function() {
          // then
          const wrongSolutionBlock = findAll(SOLUTION_BLOCK)[WRONG_ANSWER_POSITION];
          const wrongSolutionText = findAll(SOLUTION_TEXT)[WRONG_ANSWER_POSITION];

          expect(wrongSolutionBlock).to.exist;
          expect(wrongSolutionText).to.exist;
        });

        it('should display the wrong answer in line-throughed bold', async function() {
          // then
          const answerInput = findAll(ANSWER)[WRONG_ANSWER_POSITION];

          expect(answerInput).to.exist;
          expect(answerInput.classList.contains('correction-qroc-box-answer--wrong')).to.be.true;
        });
      });

    });
  });

  describe('When format is neither a paragraph nor a phrase', function() {
    beforeEach(function() {
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);
    });

    [
      { format: 'petit', expectedSize: '11' },
      { format: 'mots', expectedSize: '20' },
      { format: 'unreferenced_format', expectedSize: '20' }
    ].forEach((data) => {
      it(`should display a disabled input with expected size (${data.expectedSize}) when format is ${data.format}`, async function() {
        //given
        this.challenge.set('format', data.format);

        //when
        await render(hbs`{{qrocm-ind-solution-panel challenge=challenge answer=answer solution=solution}}`);

        //then
        expect(find(PARAGRAPH)).to.not.exist;
        expect(find(INPUT).tagName).to.equal('INPUT');
        expect(find(INPUT).getAttribute('size')).to.equal(data.expectedSize);
        expect(find(INPUT).hasAttribute('disabled')).to.be.true;
      });
    });

  });

  describe('When format is a paragraph', function() {
    beforeEach(function() {
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);
      this.challenge.set('format', 'paragraphe');
    });

    it('should display a disabled textarea', async function() {
      // when
      await render(hbs`{{qrocm-ind-solution-panel answer=answer solution=solution challenge=challenge}}`);

      // then
      expect(find(INPUT)).to.not.exist;
      expect(find(SENTENCE)).to.not.exist;
      expect(find(PARAGRAPH).tagName).to.equal('TEXTAREA');
      expect(find(PARAGRAPH).hasAttribute('disabled')).to.be.true;
    });
  });

  describe('When format is a sentence', function() {
    beforeEach(function() {
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);
      this.challenge.set('format', 'phrase');
    });

    it('should display a disabled input', async function() {
      // when
      await render(hbs`{{qrocm-ind-solution-panel answer=answer solution=solution challenge=challenge}}`);

      // then
      expect(find(INPUT)).to.not.exist;
      expect(find(PARAGRAPH)).to.not.exist;
      expect(find(SENTENCE).tagName).to.equal('INPUT');
      expect(find(SENTENCE).hasAttribute('disabled')).to.be.true;
    });
  });

});
