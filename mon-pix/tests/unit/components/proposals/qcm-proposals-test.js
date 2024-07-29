import { setupTest } from 'ember-qunit';
import { pshuffle } from 'mon-pix/utils/pshuffle';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | QCM proposals', function (hooks) {
  setupTest(hooks);

  module('shuffled', function (hooks) {
    const DEFAULT_PROPOSALS = '- prop 1\n- prop 2\n- prop 3';

    let answer;
    let answerChanged;
    const isAnswerFieldDisabled = false;
    let proposals;
    let component;
    let shuffleSeed;
    let shuffled;

    hooks.beforeEach(function () {
      proposals = DEFAULT_PROPOSALS;
      answer = {
        value: '2',
      };
      shuffleSeed = 64;
      shuffled = false;
    });

    function initComponent() {
      component = createGlimmerComponent('proposals/qcm-proposals', {
        answer,
        proposals,
        answerValue: answer.value,
        shuffleSeed,
        shuffled,
        isAnswerFieldDisabled,
        answerChanged,
      });
    }

    module('when shuffled is false', function () {
      test('should return', function (assert) {
        // Given
        const expectedLabeledRadios = [
          { checked: false, label: 'prop 1', value: 1, index: 0 },
          { checked: true, label: 'prop 2', value: 2, index: 1 },
          { checked: false, label: 'prop 3', value: 3, index: 2 },
        ];
        initComponent.call(this);

        // When
        const labeledCheckboxes = component.labeledCheckboxes;

        // Then
        assert.deepEqual(labeledCheckboxes, expectedLabeledRadios);
      });
    });

    module('when shuffled is true', function (hooks) {
      hooks.beforeEach(function () {
        shuffled = true;
      });

      test('should return', function (assert) {
        // Given
        const expectedLabeledRadios = [
          { checked: false, label: 'prop 1', value: 1, index: 0 },
          { checked: true, label: 'prop 2', value: 2, index: 1 },
          { checked: false, label: 'prop 3', value: 3, index: 2 },
        ];
        pshuffle(expectedLabeledRadios, shuffleSeed);
        initComponent.call(this);

        // When
        const labeledCheckboxes = component.labeledCheckboxes;

        // Then
        assert.deepEqual(labeledCheckboxes, expectedLabeledRadios);
      });
    });
  });
});
