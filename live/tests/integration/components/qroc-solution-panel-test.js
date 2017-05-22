import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const ANSWER_BLOCK = '.correction-qroc-box__answer';
const ANSWER_INPUT = '.correction-qroc-box--answer__input';
const SOLUTION_BLOCK = '.correction-qroc-box__solution';
const SOLUTION_DISPLAY = '.correction-qroc-box__solution-text';

const RIGHT_ANSWER_GREEN = 'rgb(19, 201, 160)';
const NO_ANSWER_GREY = 'rgb(62, 65, 73)';

describe('Integration | Component | qroc solution panel', function() {

  setupComponentTest('qroc-solution-panel', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{qroc-solution-panel}}`);
    expect(this.$()).to.have.length(1);
  });

  it('should disabled all inputs', function() {
    // given
    this.render(hbs`{{qroc-solution-panel}}`);
    const input = this.$('input');
    // then
    expect(input).to.be.disabled;
  });

  describe('comparison when the answer is right', function() {

    const assessment = Ember.Object.create({ id: 'assessment_id' });
    const challenge = Ember.Object.create({ id: 'challenge_id' });
    const answer = Ember.Object.create({ id: 'answer_id', result: 'ok', assessment, challenge });

    it('should diplay the answer in bold green and not the solution', function() {
      // given
      this.set('answer', answer);
      this.render(hbs`{{qroc-solution-panel answer=answer}}`);
      // when
      const answerInput = this.$(ANSWER_INPUT);
      const answerBlock = this.$(ANSWER_BLOCK);
      const solutionBlock = this.$(SOLUTION_BLOCK);
      // then
      expect(answerInput).to.have.length(1);
      expect(answerBlock).to.have.length(1);
      expect(answerInput.css('font-weight')).to.be.equal('bold');
      expect(answerInput.css('text-decoration')).to.be.contains('none');
      expect(answerInput.css('color')).to.be.equal(RIGHT_ANSWER_GREEN);
      expect(solutionBlock).to.have.length(0);
    });
  });

  describe('comparison when the answer is false', function() {

    beforeEach(function() {
      const assessment = Ember.Object.create({ id: 'assessment_id' });
      const challenge = Ember.Object.create({ id: 'challenge_id' });
      const answer = Ember.Object.create({ id: 'answer_id', result:'ko', assessment, challenge });

      this.set('answer', answer);
      this.render(hbs`{{qroc-solution-panel answer=answer}}`);
    });

    it('should display the false answer line-through', function() {
      // given
      const answerBlock = this.$(ANSWER_BLOCK);
      const answerInput = this.$(ANSWER_INPUT);
      // then
      expect(answerBlock).to.have.lengthOf(1);
      expect(answerInput.css('font-weight')).to.be.equal('400');
      expect(answerInput.css('text-decoration')).to.be.contains('line-through');

    });

    it('should display the solution with an arrow and the solution in bold green', function() {
      // given
      const blockSolution = this.$(SOLUTION_BLOCK);
      const blockSolutionText = this.$(SOLUTION_DISPLAY);

      // then
      expect(blockSolution).to.have.lengthOf(1);
      expect(blockSolution.css('align-items')).to.be.equal('stretch');
      expect(blockSolutionText.css('color')).to.be.equal(RIGHT_ANSWER_GREEN);
      expect(blockSolutionText.css('font-weight')).to.be.equal('bold');
    });

    describe('comparison when the answer was not given', function() {

      beforeEach(function() {
        const assessment = Ember.Object.create({ id: 'assessment_id' });
        const challenge = Ember.Object.create({ id: 'challenge_id' });
        const answer = Ember.Object.create({ id: 'answer_id', result: 'aband', assessment, challenge });

        this.set('answer', answer);
        this.set('isResultWithoutAnswer', true);
        this.render(hbs`{{qroc-solution-panel answer=answer}}`);
      });

      it('should display PAS DE REPONSE in italic', function() {
        // given
        const answerBlock = this.$(ANSWER_BLOCK);
        const answerInput = this.$(ANSWER_INPUT);
        // then
        expect(answerBlock).to.have.length(1);
        expect(answerInput.css('font-style')).to.be.equal('italic');
        expect(answerInput.css('color')).to.be.equal(NO_ANSWER_GREY);
      });
    });
  });
});
