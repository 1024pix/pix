import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | qroc-solution-panel', function () {

  setupTest('component:qroc-solution-panel', {});

  describe('#answerToDisplay', function () {

    it('should return an empty string if the answer is #ABAND#', function () {
      // given
      const answer = {
        value:'#ABAND#'
      };
      const component = this.subject();
      component.set('answer', answer);
      // when
      const answerToDisplay = component.get('answerToDisplay');
      // then
      expect(answerToDisplay).to.equal('Pas de réponse');
    });

    it('should return the answer if the answer is not #ABAND#', function () {
      // given
      const answer = {
        value:'La Reponse B'
      };
      const component = this.subject();
      component.set('answer', answer);
      // when
      const answerToDisplay = component.get('answerToDisplay');
      // then
      expect(answerToDisplay).to.equal('La Reponse B');
    });
  });

  describe('#solutionToDisplay', function () {

    it('should return the first solution if the solution has some variants', function () {
      // given
      const solution = {
        value: 'Reponse\nreponse\nréponse'
      };
      const component = this.subject();
      component.set('solution', solution);
      // when
      const solutionToDisplay = component.get('solutionToDisplay');
      // then
      expect(solutionToDisplay).to.equal('Reponse');
    });

    it('should return the solution', function () {
      // given
      const solution = {
        value: 'Reponse'
      };
      const component = this.subject();
      component.set('solution', solution);
      // when
      const solutionToDisplay = component.get('solutionToDisplay');
      // then
      expect(solutionToDisplay).to.equal('Reponse');
    });

    it('should return an empty string if the solution is null', function () {
      // given
      const emptySolution = {
        value: ''
      };
      const component = this.subject();
      component.set('solution', emptySolution);
      // when
      const solutionToDisplay = component.get('solutionToDisplay');
      // then
      expect(solutionToDisplay).to.equal('');
    });

    it('should return an empty string if the solution is an empty String', function () {
      // given
      const solutionNull = {
        value: null
      };
      const component = this.subject();
      component.set('solution', solutionNull);
      // when
      const solutionToDisplay = component.get('solutionToDisplay');
      // then
      expect(solutionToDisplay).to.equal('');
    });

  });
});
