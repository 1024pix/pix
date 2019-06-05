import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | QCU proposals', function() {

  setupTest();

  describe('Computed property "labeledRadios"', function() {

    const DEFAULT_PROPOSALS = '- prop 1\n- prop 2\n- prop 3';

    let answerValue;
    let proposals;
    let component;

    beforeEach(function() {
      proposals = DEFAULT_PROPOSALS;
      answerValue = '2';
    });

    function initComponent() {
      component = this.owner.lookup('component:qcu-proposals');
      component.set('proposals', proposals);
      component.set('answerValue', answerValue);
    }

    it('should return an array of [<proposal_text>, <boolean_answer>]', function() {
      // Given
      answerValue = '2';
      const expectedLabeledRadios = [
        ['prop 1', false],
        ['prop 2', true],
        ['prop 3', false]
      ];
      initComponent.call(this);

      // When
      const labeledRadios = component.get('labeledRadios');

      // Then
      expect(labeledRadios).to.deep.equal(expectedLabeledRadios);
    });

    it('should return an array of [<proposal_text>, <boolean_answer>] with as many items as challenge proposals', function() {
      // given
      proposals = '- prop 1\n- prop 2\n- prop 3\n- prop 4\n- prop 5';
      initComponent.call(this);

      // when
      const labeledRadios = component.get('labeledRadios');

      // then
      expect(labeledRadios).to.have.lengthOf(5);
    });

    it('should not select a radio when given answer is null', function() {
      // given
      answerValue = null;
      const expectedLabeledRadios = [
        ['prop 1', false],
        ['prop 2', false],
        ['prop 3', false]
      ];
      initComponent.call(this);

      // when
      const labeledRadios = component.get('labeledRadios');

      // then
      expect(labeledRadios).to.deep.equal(expectedLabeledRadios);
    });

    it('should not select a radio when no answer is given', function() {
      // given
      answerValue = '';
      const expectedLabeledRadios = [
        ['prop 1', false],
        ['prop 2', false],
        ['prop 3', false]
      ];
      initComponent.call(this);

      // when
      const labeledRadios = component.get('labeledRadios');

      // then
      expect(labeledRadios).to.deep.equal(expectedLabeledRadios);
    });

  });

});
