import EmberObject from '@ember/object';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

function getLabels(panelElement) {
  const labels = [];
  let currentLabel = '';

  for (const node of panelElement.childNodes) {
    if (node.nodeName === '#text' || node.nodeName === 'BR') {
      currentLabel += node.textContent;
    }
    if (node.nodeName === 'DIV') {
      labels.push(currentLabel);
      currentLabel = '';
    }
  }

  return labels;
}

const PANEL = '.rounded-panel__row';
const SOLUTION_BLOCK = '.correction-qrocm__solution';
const INPUT = '.correction-qrocm__answer-input';
const SOLUTION_TEXT = '.correction-qrocm__solution-text';

describe('Integration | Component | qrocm solution panel', function() {

  setupComponentTest('qrocm-ind-solution-panel', {
    integration: true
  });

  const assessment = EmberObject.create({ id: 'assessment_id' });
  const challenge = EmberObject.create({
    id: 'challenge_id',
    proposals: 'answer1 : ${key1}\nCarte mémoire (SD) : ${key2}\nblabla : ${key3}'
  });
  const answer = EmberObject.create({
    id: 'answer_id',
    value: 'key1: \'rightAnswer1\' key2: \'wrongAnswer2\' key3: \'\'',
    resultDetails: 'key1: true\nkey2: false\nkey3: false',
    assessment,
    challenge
  });
  const solution = 'key1:\n- rightAnswer1\nkey2:\n- rightAnswer20\n-' +
    ' rightAnswer21\nkey3 :\n-' +
    ' rightAnswer3' ;

  beforeEach(function() {
    this.set('answer', answer);
    this.set('solution', solution);
    this.set('challenge', challenge);
  });

  it('should disabled all inputs', function() {
    // when
    this.render(hbs`{{qrocm-ind-solution-panel answer=answer solution=solution challenge=challenge}}`);

    // then
    expect(document.querySelector('input')).to.have.attr('disabled');
  });

  it('should contains three labels', function() {
    // when
    this.render(hbs`{{qrocm-ind-solution-panel answer=answer solution=solution challenge=challenge}}`);

    const panelElement = document.querySelector(PANEL);
    const labels = getLabels(panelElement);

    // then
    expect(labels).to.have.lengthOf(3);
  });

  describe('comparison of a qrocm-ind with a right answer, a wrong answer and one empty answer', function() {

    describe('right answer display', function() {

      it('should display the right answer in green bold', function() {
        // when
        this.render(hbs`{{qrocm-ind-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // then
        const panelElement = document.querySelector(PANEL);
        const answerLabel = getLabels(panelElement)[0];
        const answerInput = document.querySelector(INPUT);

        expect(answerLabel).to.exist;
        expect(answerInput).to.exist;

        const answerInputStyles = window.getComputedStyle(answerInput);
        expect(answerInputStyles.getPropertyValue('text-decoration')).to.include('none');
      });

      it('should not display the solution', function() {
        // when
        this.render(hbs`{{qrocm-ind-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // then
        const solutionBlock = document.querySelectorAll(SOLUTION_BLOCK);

        expect(solutionBlock).to.have.lengthOf(2);
      });
    });

    describe('wrong answer display', function() {

      it('should display the wrong answer in the second div line-throughed bold', function() {
        // when
        this.render(hbs`{{qrocm-ind-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // then
        const panelElement = document.querySelector(PANEL);
        const answerLabel = getLabels(panelElement)[1];
        const answerInput = document.querySelectorAll(INPUT)[1];

        expect(answerLabel).to.exist;
        expect(answerInput).to.exist;

        const answerInputStyles = window.getComputedStyle(answerInput);
        expect(answerInputStyles.getPropertyValue('text-decoration')).to.include('line-through');
      });

      it('should display one solution in bold green below the input', function() {
        // when
        this.render(hbs`{{qrocm-ind-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // then
        const solutionBlock = document.querySelectorAll(SOLUTION_BLOCK)[1];
        const solutionText = document.querySelectorAll(SOLUTION_TEXT)[1];

        expect(solutionBlock).to.exist;
        expect(solutionText).to.exist;

        const solutionTextStyles = window.getComputedStyle(solutionText);
        expect(solutionTextStyles.getPropertyValue('text-decoration')).to.include('none');
      });
    });

    describe('no answer display', function() {

      it('should display the empty answer in the third div with "pas de réponse" in italic', function() {
        // when
        this.render(hbs`{{qrocm-ind-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // then
        const panelElement = document.querySelector(PANEL);
        const answerLabel = getLabels(panelElement)[2];
        const answerInput = document.querySelectorAll(INPUT)[2];

        expect(answerLabel).to.exist;
        expect(answerInput).to.exist;

        const answerInputStyles = window.getComputedStyle(answerInput);
        expect(answerInputStyles.getPropertyValue('text-decoration')).to.include('none');
      });

      it('should display one solution in bold green below the input', function() {
        // given
        this.render(hbs`{{qrocm-ind-solution-panel challenge=challenge answer=answer solution=solution}}`);

        // then
        const solutionBlock = document.querySelectorAll(SOLUTION_BLOCK)[1];
        const solutionText = document.querySelectorAll(SOLUTION_TEXT)[1];

        expect(solutionBlock).to.exist;
        expect(solutionText).to.exist;

        const solutionTextStyles = window.getComputedStyle(solutionText);
        expect(solutionTextStyles.getPropertyValue('text-decoration')).to.include('none');
      });
    });
  });
});
