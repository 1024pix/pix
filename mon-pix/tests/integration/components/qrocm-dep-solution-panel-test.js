import EmberObject from '@ember/object';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const ANSWER = '.correction-qrocm__answer';
const INPUT = 'input.correction-qrocm__answer--input';
const TEXTAREA = 'textarea.correction-qrocm__answer--textarea';
const SOLUTION_BLOCK = '.correction-qrocm__solution';
const SOLUTION_TEXT = '.correction-qrocm__solution-text';

const CARIBBEAN_GREEN_COLOR = 'rgb(19, 201, 160)';

const classByResultKey = {
  ok: 'ok',
  ko: 'ko',
  partially: 'partially',
  aband: 'aband'
};

describe('Integration | Component | qrocm dep solution panel', function() {

  setupRenderingTest();

  const assessment = EmberObject.create({ id: 'assessment_id' });
  const challenge = EmberObject.create({
    id: 'challenge_id',
    proposals: '${key1}\n${key2}',
    format: 'petit'
  });
  const solution = 'rightAnswer:\n' +
    '- rightAnswer1\n' +
    '- rightAnswer2';

  [
    { format: 'petit' },
    { format: 'unreferenced_format' },
    { format: 'paragraphe' },
  ].forEach((data) => {
    describe('Whatever the format', function() {

      beforeEach(function() {
        this.set('solution', solution);
        this.set('challenge', challenge);
        this.challenge.set('format', data.format);
      });

      it('should contains two labels', async function() {
        // given
        const answer = EmberObject.create({
          id: 'answer_id',
          value: 'key1: \'rightAnswer1\' key2: \'rightAnswer2\'',
          result: classByResultKey.ok,
          assessment,
          challenge
        });
        this.set('answer', answer);

        // when
        await render(hbs`{{qrocm-dep-solution-panel answer=answer solution=solution challenge=challenge}}`);

        // then
        expect(findAll('label')).to.have.lengthOf(2);
      });

      describe('When the answer is correct', function() {

        beforeEach(function() {
          const answer = EmberObject.create({
            id: 'answer_id',
            value: 'key1: \'rightAnswer1\' key2: \'rightAnswer2\'',
            result: classByResultKey.ok,
            assessment,
            challenge
          });
          this.set('answer', answer);
        });

        it('should display the correct answer in green bold', async function() {
          // given
          const boldFontWeight = '700';

          // when
          await render(hbs`{{qrocm-dep-solution-panel challenge=challenge answer=answer solution=solution}}`);

          // then
          const firstCorrectAnswerText = findAll(ANSWER)[0];
          const correctAnswerStyle = window.getComputedStyle(firstCorrectAnswerText);

          expect(correctAnswerStyle.getPropertyValue('color')).to.equal(CARIBBEAN_GREEN_COLOR);
          expect(correctAnswerStyle.getPropertyValue('text-decoration')).to.include('none');
          expect(correctAnswerStyle.getPropertyValue('font-weight')).to.equal(boldFontWeight);
        });

        it('should not have solution block', async function() {
          // when
          await render(hbs`{{qrocm-dep-solution-panel challenge=challenge answer=answer solution=solution}}`);

          // then
          const solutionBlockList = findAll(SOLUTION_BLOCK);
          expect(solutionBlockList).to.have.lengthOf(0);
        });
      });

      describe('When there is no answer', function() {
        beforeEach(function() {
          const answer = EmberObject.create({
            id: 'answer_id',
            value: 'key1: \'\' key2: \'\'',
            result: classByResultKey.aband,
            assessment,
            challenge
          });
          this.set('answer', answer);
        });

        it('should display one solution in bold green', async function() {
          // when
          await render(hbs`{{qrocm-dep-solution-panel challenge=challenge answer=answer solution=solution}}`);

          // then
          const noAnswerSolutionBlockList = findAll(SOLUTION_BLOCK);
          const noAnswerSolutionText = find(SOLUTION_TEXT);
          const noAnswerSolutionTextStyle = window.getComputedStyle(noAnswerSolutionText);

          expect(noAnswerSolutionBlockList).to.have.lengthOf(1);
          expect(noAnswerSolutionTextStyle.getPropertyValue('color')).to.equal(CARIBBEAN_GREEN_COLOR);
          expect(noAnswerSolutionTextStyle.getPropertyValue('text-decoration')).to.include('none');
        });

        it('should display the empty answer with the default message "Pas de réponse" in italic', async function() {
          // given
          const emptyDefaultMessage = 'Pas de réponse';
          // when
          await render(hbs`{{qrocm-dep-solution-panel challenge=challenge answer=answer solution=solution}}`);

          // then
          const firstAnswerInput = findAll(ANSWER)[0];
          const answerInputStyles = window.getComputedStyle(firstAnswerInput);

          expect(firstAnswerInput).to.exist;
          expect(firstAnswerInput.value).to.equal(emptyDefaultMessage);
          expect(answerInputStyles.getPropertyValue('text-decoration')).to.include('none');
          expect(answerInputStyles.getPropertyValue('font-style')).to.equal('italic');
        });
      });

      describe('When the answer is wrong', function() {
        beforeEach(function() {
          const answer = EmberObject.create({
            id: 'answer_id',
            value: 'key1: \'wrongAnswer1\' key2: \'wrongAnswer2\'',
            result: classByResultKey.ko,
            assessment,
            challenge
          });
          this.set('answer', answer);
        });

        it('should display one solution in bold green', async function() {
          // when
          await render(hbs`{{qrocm-dep-solution-panel challenge=challenge answer=answer solution=solution}}`);

          // then
          const wrongSolutionBlock = find(SOLUTION_BLOCK);
          const wrongSolutionText = find(SOLUTION_TEXT);
          const wrongSolutionTextStyles = window.getComputedStyle(wrongSolutionText);

          expect(wrongSolutionBlock).to.exist;
          expect(wrongSolutionText).to.exist;
          expect(wrongSolutionTextStyles.getPropertyValue('color')).to.equal(CARIBBEAN_GREEN_COLOR);
          expect(wrongSolutionTextStyles.getPropertyValue('text-decoration')).to.include('none');
        });

        it('should display the wrong answer in bold font-weight without text-decoration', async function() {
          // given
          const boldFontWeight = '400';

          // when
          await render(hbs`{{qrocm-dep-solution-panel challenge=challenge answer=answer solution=solution}}`);

          // then
          const firstAnswerInput = findAll(ANSWER)[0];
          const answerInputStyles = window.getComputedStyle(firstAnswerInput);

          expect(firstAnswerInput).to.exist;
          expect(answerInputStyles.getPropertyValue('text-decoration')).to.include('none');
          expect(answerInputStyles.getPropertyValue('font-weight')).to.equal(boldFontWeight);
        });
      });

    });
  });

  describe('When format is not a paragraph', function() {
    beforeEach(function() {
      const answer = EmberObject.create({
        id: 'answer_id',
        value: 'key1: \'rightAnswer1\' key2: \'rightAnswer2\'',
        result: classByResultKey.ok,
        assessment,
        challenge
      });
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);
    });

    [
      { format: 'petit', expectedSize: '5' },
      { format: 'mots', expectedSize: '15' },
      { format: 'phrase', expectedSize: '50' },
      { format: 'unreferenced_format', expectedSize: '15' }
    ].forEach((data) => {
      it(`should display a disabled input with expected size (${data.expectedSize}) when format is ${data.format}`, async function() {
        //given
        this.challenge.set('format', data.format);

        //when
        await render(hbs`{{qrocm-dep-solution-panel challenge=challenge answer=answer solution=solution}}`);

        //then
        expect(find(TEXTAREA)).to.not.exist;
        expect(find(INPUT).tagName).to.equal('INPUT');
        expect(find(INPUT).getAttribute('size')).to.equal(data.expectedSize);
        expect(find(INPUT).hasAttribute('disabled')).to.be.true;
      });
    });

  });

  describe('When format is a paragraph', function() {
    beforeEach(function() {
      const answer = EmberObject.create({
        id: 'answer_id',
        value: 'key1: \'rightAnswer1\' key2: \'rightAnswer2\'',
        result: classByResultKey.ok,
        assessment,
        challenge
      });
      this.set('answer', answer);
      this.set('solution', solution);
      this.set('challenge', challenge);
      this.challenge.set('format', 'paragraphe');
    });

    it('should display a disabled textarea', async function() {
      // when
      await render(hbs`{{qrocm-dep-solution-panel answer=answer solution=solution challenge=challenge}}`);

      // then
      expect(find(INPUT)).to.not.exist;
      expect(find(TEXTAREA).tagName).to.equal('TEXTAREA');
      expect(find(TEXTAREA).hasAttribute('disabled')).to.be.true;
    });

  });

});
