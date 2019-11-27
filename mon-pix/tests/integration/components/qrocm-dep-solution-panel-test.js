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

const classByResultKey = {
  ok: 'ok',
  ko: 'ko',
  partially: 'partially',
  aband: 'aband'
};

describe('Integration | Component | QROCm dep solution panel', function() {

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
    { format: 'phrase' },
    { format: 'paragraphe' },
    { format: 'unreferenced_format' },
  ].forEach((data) => {
    describe(`Whatever the format (testing ${data.format} format)`, function() {

      beforeEach(function() {
        this.set('solution', solution);
        this.set('challenge', challenge);
        this.challenge.set('format', data.format);
      });

      describe('When the answer is correct', function() {

        beforeEach(async function() {
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
          await render(hbs`{{qrocm-dep-solution-panel challenge=challenge answer=answer solution=solution}}`);
        });

        it('should display the correct answer in green bold', function() {
          // then
          const firstAnswerInput = findAll(ANSWER)[0];
          expect(firstAnswerInput.classList.contains('correction-qroc-box-answer--correct')).to.be.true;
        });

        it('should not have solution block', function() {
          // then
          const solutionBlockList = findAll(SOLUTION_BLOCK);
          expect(solutionBlockList).to.have.lengthOf(0);
        });
      });

      describe('When there is no answer', function() {
        const EMPTY_DEFAULT_MESSAGE = 'Pas de réponse';

        beforeEach(async function() {
          // given
          const answer = EmberObject.create({
            id: 'answer_id',
            value: 'key1: \'\' key2: \'\'',
            result: classByResultKey.aband,
            assessment,
            challenge
          });
          this.set('answer', answer);

          // when
          await render(hbs`{{qrocm-dep-solution-panel challenge=challenge answer=answer solution=solution}}`);
        });

        it('should display one solution in bold green', async function() {
          // then
          const noAnswerSolutionBlockList = findAll(SOLUTION_BLOCK);
          expect(noAnswerSolutionBlockList).to.have.lengthOf(1);
        });

        it('should display the empty answer with the default message "Pas de réponse" in italic', async function() {
          // then
          const firstAnswerInput = findAll(ANSWER)[0];
          expect(firstAnswerInput).to.exist;
          expect(firstAnswerInput.value).to.equal(EMPTY_DEFAULT_MESSAGE);
          expect(firstAnswerInput.classList.contains('correction-qroc-box-answer--aband')).to.be.true;
        });
      });

      describe('When the answer is wrong', function() {
        beforeEach(async function() {
          // given
          const answer = EmberObject.create({
            id: 'answer_id',
            value: 'key1: \'wrongAnswer1\' key2: \'wrongAnswer2\'',
            result: classByResultKey.ko,
            assessment,
            challenge
          });
          this.set('answer', answer);

          // when
          await render(hbs`{{qrocm-dep-solution-panel challenge=challenge answer=answer solution=solution}}`);
        });

        it('should display one solution in bold green', async function() {
          // then
          const wrongSolutionBlock = find(SOLUTION_BLOCK);
          const wrongSolutionText = find(SOLUTION_TEXT);

          expect(wrongSolutionBlock).to.exist;
          expect(wrongSolutionText).to.exist;
        });

        it('should display the wrong answer in standard style since we do not handle single wrong answer yet', async function() {
          // then
          const firstAnswerInput = findAll(ANSWER)[0];

          expect(firstAnswerInput).to.exist;
          expect(firstAnswerInput.classList.contains('correction-qroc-box-answer--wrong')).to.be.false;
        });
      });

    });
  });

  describe('When format is neither a paragraph nor a sentence', function() {
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
      { format: 'petit', expectedSize: '11' },
      { format: 'mots', expectedSize: '20' },
      { format: 'unreferenced_format', expectedSize: '20' }
    ].forEach((data) => {
      it(`should display a disabled input with expected size (${data.expectedSize}) when format is ${data.format}`, async function() {
        //given
        this.challenge.set('format', data.format);

        //when
        await render(hbs`{{qrocm-dep-solution-panel challenge=challenge answer=answer solution=solution}}`);

        //then
        expect(find(PARAGRAPH)).to.not.exist;
        expect(find(SENTENCE)).to.not.exist;
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
      expect(find(SENTENCE)).to.not.exist;
      expect(find(PARAGRAPH).tagName).to.equal('TEXTAREA');
      expect(find(PARAGRAPH).hasAttribute('disabled')).to.be.true;
    });

  });

  describe('When format is a sentence', function() {
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
      this.challenge.set('format', 'phrase');
    });

    it('should display a disabled input', async function() {
      // when
      await render(hbs`{{qrocm-dep-solution-panel answer=answer solution=solution challenge=challenge}}`);

      // then
      expect(find(INPUT)).to.not.exist;
      expect(find(PARAGRAPH)).to.not.exist;
      expect(find(SENTENCE).tagName).to.equal('INPUT');
      expect(find(SENTENCE).hasAttribute('disabled')).to.be.true;
    });

  });

});
