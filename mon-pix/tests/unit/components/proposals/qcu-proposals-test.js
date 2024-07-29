import { setupTest } from 'ember-qunit';
import { pshuffle } from 'mon-pix/utils/pshuffle';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | QCU proposals', function (hooks) {
  setupTest(hooks);

  module('Computed property "labeledRadios"', function (hooks) {
    const DEFAULT_PROPOSALS = '- prop 1\n- prop 2\n- prop 3';

    let answerValue;
    let proposals;
    let component;
    let shuffleSeed;
    let shuffled;

    hooks.beforeEach(function () {
      proposals = DEFAULT_PROPOSALS;
      answerValue = '2';
      shuffleSeed = 64;
      shuffled = false;
    });

    function initComponent() {
      component = createGlimmerComponent('proposals/qcu-proposals', { proposals, answerValue, shuffleSeed, shuffled });
    }

    module('when shuffled is false', function () {
      test('should return an array of [<proposal_text>, <boolean_answer>]', function (assert) {
        // Given
        answerValue = '2';
        const expectedLabeledRadios = [
          { checked: false, label: 'prop 1', value: 1, index: 0 },
          { checked: true, label: 'prop 2', value: 2, index: 1 },
          { checked: false, label: 'prop 3', value: 3, index: 2 },
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
          { checked: false, label: 'prop 1', value: 1, index: 0 },
          { checked: false, label: 'prop 2', value: 2, index: 1 },
          { checked: false, label: 'prop 3', value: 3, index: 2 },
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
          { checked: false, label: 'prop 1', value: 1, index: 0 },
          { checked: false, label: 'prop 2', value: 2, index: 1 },
          { checked: false, label: 'prop 3', value: 3, index: 2 },
        ];
        initComponent.call(this);

        // when
        const labeledRadios = component.labeledRadios;

        // then
        assert.deepEqual(labeledRadios, expectedLabeledRadios);
      });
    });
    module('when shuffled is true', function () {
      test('should return an array of [<proposal_text>, <boolean_answer>]', function (assert) {
        // Given
        shuffled = true;
        answerValue = '2';
        const expectedLabeledRadios = [
          { checked: false, label: 'prop 1', value: 1, index: 0 },
          { checked: true, label: 'prop 2', value: 2, index: 1 },
          { checked: false, label: 'prop 3', value: 3, index: 2 },
        ];
        initComponent.call(this);
        pshuffle(expectedLabeledRadios, shuffleSeed);

        // When
        const labeledRadios = component.labeledRadios;

        // Then
        assert.deepEqual(labeledRadios, expectedLabeledRadios);
      });
    });
  });
});
