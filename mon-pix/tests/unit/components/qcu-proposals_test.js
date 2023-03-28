import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | QCU proposals', function (hooks) {
  setupTest(hooks);

  module('Computed property "labeledRadios"', function (hooks) {
    const DEFAULT_PROPOSALS = '- prop 1\n- prop 2\n- prop 3';

    let answerValue;
    let proposals;
    let component;

    hooks.beforeEach(function () {
      proposals = DEFAULT_PROPOSALS;
      answerValue = '2';
    });

    function initComponent() {
      component = createGlimmerComponent('component:qcu-proposals', { proposals, answerValue });
    }

    test('should return an array of [<proposal_text>, <boolean_answer>]', function (assert) {
      // Given
      answerValue = '2';
      const expectedLabeledRadios = [
        ['prop 1', false],
        ['prop 2', true],
        ['prop 3', false],
      ];
      initComponent.call(this);

      // When
      const labeledRadios = component.labeledRadios;

      // Then
      assert.deepEqual(labeledRadios, expectedLabeledRadios);
    });

    test('should return an array of [<proposal_text>, <boolean_answer>] with as many items as challenge proposals', function (assert) {
      // given
      proposals = '- prop 1\n- prop 2\n- prop 3\n- prop 4\n- prop 5';
      initComponent.call(this);

      // when
      const labeledRadios = component.labeledRadios;

      // then
      assert.strictEqual(labeledRadios.length, 5);
    });

    test('should not select a radio when given answer is null', function (assert) {
      // given
      answerValue = null;
      const expectedLabeledRadios = [
        ['prop 1', false],
        ['prop 2', false],
        ['prop 3', false],
      ];
      initComponent.call(this);

      // when
      const labeledRadios = component.labeledRadios;

      // then
      assert.deepEqual(labeledRadios, expectedLabeledRadios);
    });

    test('should not select a radio when no answer is given', function (assert) {
      // given
      answerValue = '';
      const expectedLabeledRadios = [
        ['prop 1', false],
        ['prop 2', false],
        ['prop 3', false],
      ];
      initComponent.call(this);

      // when
      const labeledRadios = component.labeledRadios;

      // then
      assert.deepEqual(labeledRadios, expectedLabeledRadios);
    });
  });
});
