import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | qroc-solution-panel', function() {

  setupTest();
  const rightAnswer = { result: 'ok' };
  const wrongAnswer = { result: 'ko' };

  describe('#isResultOk', function() {

    it('should return true when result is ok', function() {
      // given
      const component = createGlimmerComponent('component:qroc-solution-panel', { answer: rightAnswer });
      // when
      const isResultOk = component.isResultOk;
      // then
      expect(isResultOk).to.be.true;
    });

    it('should return true when result is not ok', function() {
      // given
      const component = createGlimmerComponent('component:qroc-solution-panel', { answer: wrongAnswer });
      // when
      const isResultOk = component.isResultOk;
      // then
      expect(isResultOk).to.be.false;
    });

  });

  describe('#answerToDisplay', function() {

    it('should return PAS DE REPONSE if the answer is #ABAND#', function() {
      // given
      const answer = {
        value: '#ABAND#',
      };
      const component = createGlimmerComponent('component:qroc-solution-panel', { answer });
      // when
      const answerToDisplay = component.answerToDisplay;
      // then
      expect(answerToDisplay).to.equal('Pas de réponse');
    });

    it('should return the answer if the answer is not #ABAND#', function() {
      // given
      const answer = {
        value: 'La Reponse B',
      };
      const component = createGlimmerComponent('component:qroc-solution-panel', { answer });
      // when
      const answerToDisplay = component.answerToDisplay;
      // then
      expect(answerToDisplay).to.equal('La Reponse B');
    });
  });

  describe('#solutionToDisplay', function() {

    it('should return the first solution if the solution has some variants', function() {
      // given
      const solution = 'Reponse\nreponse\nréponse';
      const component = createGlimmerComponent('component:qroc-solution-panel', { solution });
      // when
      const solutionToDisplay = component.solutionToDisplay;
      // then
      expect(solutionToDisplay).to.equal('Reponse');
    });

    it('should return the solution', function() {
      // given
      const solution = 'Reponse';
      const component = createGlimmerComponent('component:qroc-solution-panel', { solution });
      // when
      const solutionToDisplay = component.solutionToDisplay;
      // then
      expect(solutionToDisplay).to.equal('Reponse');
    });

    it('should return an empty string if the solution is null', function() {
      // given
      const emptySolution = '';
      const component = createGlimmerComponent('component:qroc-solution-panel', { solution: emptySolution });
      // when
      const solutionToDisplay = component.solutionToDisplay;
      // then
      expect(solutionToDisplay).to.equal('');
    });

    it('should return an empty string if the solution is an empty String', function() {
      // given
      const solutionNull = null;
      const component = createGlimmerComponent('component:qroc-solution-panel', { solution: solutionNull });
      // when
      const solutionToDisplay = component.solutionToDisplay;
      // then
      expect(solutionToDisplay).to.equal('');
    });
  });
});
