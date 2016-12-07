import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QcmProposalsComponent', function () {

  setupComponentTest('qcu-proposals', {
    needs: ['helper:inc']
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

    function initComponent() {
      const component = this.subject();
      component.set('proposals', proposals);
      component.set('answers', answers);
      component.set('answerChanged', answerChangedHandler);
    }

    function renderComponent() {
      this.render(hbs`{{qcu-proposals answers=answers proposals=proposals onAnswerUpdated='answerChanged'}}`);
    }

    // Inspired from:
    // - Ember-mocha: https://github.com/emberjs/ember-mocha#setup-component-tests
    // - Ember: https://guides.emberjs.com/v2.10.0/testing/testing-components
    // -        https://guides.emberjs.com/v2.10.0/tutorial/autocomplete-component/
    it('should render as much radio buttons as proposals', function () {
      // given
      initComponent.call(this);

      // when
      renderComponent.call(this);

      // then
      expect(this.$('.challenge-proposal')).to.have.lengthOf(proposals.length);
    });

    it.skip('should unselect all radio buttons if no answer was given (default)', function () {
    });

    it.skip('should select corresponding radio button if an answer was given', function () {
    });

  });

});
