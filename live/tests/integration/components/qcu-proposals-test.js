import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QcuProposals', function () {

  setupComponentTest('qcu-proposals', {
    integration: true
  });

  /* Rendering
   ----------------------------------------------------- */

  describe('Rendering', function () {

    let proposals;
    let answers;
    let answerChangedHandler;

    beforeEach(function () {
      proposals = ['prop 1', 'prop 2', 'prop 3'];
      answers = [false, true, false];
      answerChangedHandler = () => true;
    });

    // Inspired from:
    // - Ember-mocha: https://github.com/emberjs/ember-mocha#setup-component-tests
    // - Ember: https://guides.emberjs.com/v2.10.0/testing/testing-components
    // -        https://guides.emberjs.com/v2.10.0/tutorial/autocomplete-component/
    it('should render as much radio buttons as proposals', function () {
      // given
      this.set('proposals', proposals);
      this.set('answers', answers);
      this.set('answerChanged', answerChangedHandler);

      // when
      this.render(hbs`{{qcu-proposals answers=answers proposals=proposals onAnswerUpdated='answerChanged'}}`);

      // then
      expect(this.$('.challenge-response__proposal-input')).to.have.lengthOf(proposals.length);
    });



  });

});
