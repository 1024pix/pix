import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const FIRST_CORRECTION_BLOCK = '.correction-qrocm:nth-child(1)';
const SECOND_CORRECTION_BLOCK = '.correction-qrocm:nth-child(2)';
const THIRD_CORRECTION_BLOCK = '.correction-qrocm:nth-child(3)';
const SOLUTION_BLOCK = '.correction-qrocm__solution';
const LABEL = '.correction-qrocm__label';
const INPUT = '.correction-qrocm__answer-input';
const SOLUTION_TEXT = '.correction-qrocm__solution-text';

describe('Integration | Component | qrocm solution panel', function() {

  setupComponentTest('qrocm-ind-solution-panel', {
    integration: true
  });

  const assessment = Ember.Object.create({ id: 'assessment_id' });
  const challenge = Ember.Object.create({
    id: 'challenge_id',
    proposals: 'answer1 : ${key1}\nCarte mémoire (SD) : ${key2}\nblabla : ${key3}'
  });
  const answer = Ember.Object.create({
    id: 'answer_id',
    value: 'key1: \'rightAnswer1\' key2: \'wrongAnswer2\' key3: \'\'',
    resultDetails: 'key1: true\nkey2: false\nkey3: false',
    assessment,
    challenge
  });
  const solution = Ember.Object.create({ value: 'key1:\n- rightAnswer1\nkey2:\n- rightAnswer20\n- rightAnswer21\nkey3 :\n- rightAnswer3' });

  beforeEach(function() {
    this.set('answer', answer);
    this.set('solution', solution);
    this.set('challenge', challenge);
  });

  it('renders', function() {
    this.render(hbs`{{qrocm-ind-solution-panel answer=answer solution=solution challenge=challenge}}`);
    expect(this.$()).to.have.lengthOf(1);
  });

  it('should disabled all inputs', function() {
    // given
    this.render(hbs`{{qrocm-ind-solution-panel answer=answer solution=solution challenge=challenge}}`);
    const input = this.$('input');
    // then
    expect(input).to.be.disabled;
  });

  it('should contains three labels', function() {
    // given
    this.render(hbs`{{qrocm-ind-solution-panel answer=answer solution=solution challenge=challenge}}`);
    const labels = this.$(LABEL);
    // then
    expect(labels).to.have.lengthOf(3);
  });

  describe('comparison of a qrocm-ind with a right answer, a wrong answer and one empty answer', function() {

    describe('right answer display', function() {

      it('should display the right answer in green bold', function() {
        // given
        this.render(hbs`{{qrocm-ind-solution-panel challenge=challenge answer=answer solution=solution}}`);
        const answerBlock = this.$(FIRST_CORRECTION_BLOCK);
        const answerLabel = this.$(FIRST_CORRECTION_BLOCK + ' ' + LABEL);
        const answerInput = this.$(FIRST_CORRECTION_BLOCK + ' ' + INPUT);

        // then
        expect(answerBlock).to.have.lengthOf(1);
        expect(answerLabel).to.have.lengthOf(1);
        expect(answerInput).to.have.lengthOf(1);

        expect(answerInput.css('text-decoration')).to.contain('none');
      });

      it('should not display the solution', function() {
        // given
        this.render(hbs`{{qrocm-ind-solution-panel challenge=challenge answer=answer solution=solution}}`);
        const solutionBlock = this.$(FIRST_CORRECTION_BLOCK + ' ' + SOLUTION_BLOCK);

        // then
        expect(solutionBlock).to.have.lengthOf(0);
      });
    });

    describe('wrong answer display', function() {

      it('should display the wrong answer in the second div line-throughed bold', function() {
        // given
        this.render(hbs`{{qrocm-ind-solution-panel challenge=challenge answer=answer solution=solution}}`);
        const answerBlock = this.$(SECOND_CORRECTION_BLOCK);
        const answerLabel = this.$(SECOND_CORRECTION_BLOCK + ' ' + LABEL);
        const answerInput = this.$(SECOND_CORRECTION_BLOCK + ' ' + INPUT);

        // then
        expect(answerBlock).to.have.lengthOf(1);
        expect(answerLabel).to.have.lengthOf(1);
        expect(answerInput).to.have.lengthOf(1);

        expect(answerInput.css('text-decoration')).to.contain('line-through');
      });

      it('should display one solution in bold green below the input', function() {
        // given
        this.render(hbs`{{qrocm-ind-solution-panel challenge=challenge answer=answer solution=solution}}`);
        const solutionBlock = this.$(SECOND_CORRECTION_BLOCK + ' ' + SOLUTION_BLOCK);
        const solutionText = this.$(SECOND_CORRECTION_BLOCK + ' ' + SOLUTION_BLOCK + ' ' + SOLUTION_TEXT);

        // then
        expect(solutionBlock).to.have.lengthOf(1);
        expect(solutionText).to.have.lengthOf(1);

        expect(solutionText.css('text-decoration')).to.contain('none');
      });
    });

    describe('no answer display', function() {

      it('should display the empty answer in the third div with "pas de réponse" in italic', function() {
        // given
        this.render(hbs`{{qrocm-ind-solution-panel challenge=challenge answer=answer solution=solution}}`);
        const answerBlock = this.$(THIRD_CORRECTION_BLOCK);
        const answerLabel = this.$(THIRD_CORRECTION_BLOCK + ' ' + LABEL);
        const answerInput = this.$(THIRD_CORRECTION_BLOCK + ' ' + INPUT);

        // then
        expect(answerBlock).to.have.lengthOf(1);
        expect(answerLabel).to.have.lengthOf(1);
        expect(answerInput).to.have.lengthOf(1);

        expect(answerInput.css('text-decoration')).to.contain('none');
      });

      it('should display one solution in bold green below the input', function() {
        // given
        this.render(hbs`{{qrocm-ind-solution-panel challenge=challenge answer=answer solution=solution}}`);
        const solutionBlock = this.$(THIRD_CORRECTION_BLOCK + ' ' + SOLUTION_BLOCK);
        const solutionText = this.$(THIRD_CORRECTION_BLOCK + ' ' + SOLUTION_BLOCK + ' ' + SOLUTION_TEXT);

        // then
        expect(solutionBlock).to.have.lengthOf(1);
        expect(solutionText).to.have.lengthOf(1);

        expect(solutionText.css('text-decoration')).to.contain('none');
      });
    });
  });
});
