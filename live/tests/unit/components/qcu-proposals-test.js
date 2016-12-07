import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import _ from 'lodash/lodash';

describe('Unit | Component | QcmProposalsComponent', function () {

  setupTest('component:qcu-proposals', {});

  /* Computed property "labeledRadios"
   ----------------------------------------------------- */

  describe('Computed property "labeledRadios"', function () {

    const DEFAULT_PROPOSALS = ['prop 1', 'prop 2', 'prop 3'];
    const DEFAULT_ANSWERS = [false, true, false];
    const PROPOSAL_TEXT = 0;
    const BOOLEAN_ANSWER = 1;

    let answers;
    let proposals;
    let component;

    beforeEach(function () {
      proposals = DEFAULT_PROPOSALS;
      answers = DEFAULT_ANSWERS;
    });

    function initComponent() {
      component = this.subject();
      component.set('proposals', proposals);
      component.set('answers', answers);
    }

    /*
     * Ex :
     * - proposals = ['prop 1', 'prop 2', 'prop 3']
     * - answers = [false, true, false]
     *
     * => labeledRadios = [['prop 1', false], ['prop 2', true], ['prop 3', false]]
     */
    it('should return an array of [<proposal_text>, <boolean_answer>]', function () {
      // given
      initComponent.call(this);

      // when
      const labeledRadios = component.get('labeledRadios');

      // then
      expect(labeledRadios[0][PROPOSAL_TEXT]).to.equal(DEFAULT_PROPOSALS[0]);
      expect(labeledRadios[0][BOOLEAN_ANSWER]).to.equal(DEFAULT_ANSWERS[0]);

      expect(labeledRadios[1][PROPOSAL_TEXT]).to.equal(DEFAULT_PROPOSALS[1]);
      expect(labeledRadios[1][BOOLEAN_ANSWER]).to.equal(DEFAULT_ANSWERS[1]);

      expect(labeledRadios[2][PROPOSAL_TEXT]).to.equal(DEFAULT_PROPOSALS[2]);
      expect(labeledRadios[2][BOOLEAN_ANSWER]).to.equal(DEFAULT_ANSWERS[2]);
    });

    it('should return an array of [<proposal_text>, <boolean_answer>] with as many items than challenge proposals', function () {
      // given
      proposals = ['prop 1', 'prop 2', 'prop 3', 'prop 4', 'prop 5'];
      initComponent.call(this);

      // when
      const labeledRadios = component.get('labeledRadios');

      // then
      expect(labeledRadios).to.have.lengthOf(proposals.length);
    });

    it('should return an array of [<proposal_text>, <boolean_answer>] with all <boolean_answer> values set to "false" when given answer is "null"', function () {
      // given
      answers = null;
      initComponent.call(this);

      // when
      const labeledRadios = component.get('labeledRadios');

      // then
      expect(_.every(labeledRadios, (labeledRadio) => labeledRadio[1] === false)).to.be.true;
    });

    it('should return an array of [<proposal_text>, <boolean_answer>] with <boolean_answer> values set to "false" when answer value is "null" or "undefined"', function () {
      // given
      answers = [true, undefined, null];
      initComponent.call(this);

      // when
      const labeledRadios = component.get('labeledRadios');

      // then
      expect(labeledRadios[0][BOOLEAN_ANSWER]).to.equal(true);
      expect(labeledRadios[1][BOOLEAN_ANSWER]).to.equal(false);
      expect(labeledRadios[2][BOOLEAN_ANSWER]).to.equal(false);
    });

  });

});
