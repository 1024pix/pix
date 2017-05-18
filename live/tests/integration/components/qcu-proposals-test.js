import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QCU proposals', function() {

  setupComponentTest('qcu-proposals', {
    integration: true
  });

  /* Rendering
   ----------------------------------------------------- */

  describe('Rendering', function() {

    let proposals;
    let answers;
    let answerChangedHandler;

    beforeEach(function() {
      proposals = '- prop 1\n- prop 2\n- prop 3';
      answers = [false, true, false];
      answerChangedHandler = () => true;
    });

    // Inspired from:
    // - Ember-mocha: https://github.com/emberjs/ember-mocha#setup-component-tests
    // - Ember: https://guides.emberjs.com/v2.10.0/testing/testing-components
    // -        https://guides.emberjs.com/v2.10.0/tutorial/autocomplete-component/
    it('should render as much radio buttons as proposals', function() {
      // given
      this.set('proposals', proposals);
      this.set('answers', answers);
      this.set('answerChanged', answerChangedHandler);

      // when
      this.render(hbs`{{qcu-proposals answers=answers proposals=proposals answerChanged='answerChanged'}}`);

      // then
      expect(this.$('.proposal-text')).to.have.lengthOf(3);
    });

  });

});
