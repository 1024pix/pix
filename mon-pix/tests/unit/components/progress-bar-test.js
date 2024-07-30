import { htmlSafe } from '@ember/template';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Component | progress-bar', function (hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('progress-bar');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('@currentStepIndex', function () {
    test('should return the current step index from service', function (assert) {
      // given
      const expectedCurrentStepIndex = 2;
      sinon.stub(progressInAssessment, 'getCurrentStepIndex').returns(expectedCurrentStepIndex);

      // when
      const currentStepNumber = component.currentStepIndex;

      // then
      assert.deepEqual(currentStepNumber, expectedCurrentStepIndex);
    });
  });

  module('@maxStepsNumber', function () {
    test('should return the maxStepsNumber from service', function (assert) {
      // given
      const expectedMaxStepsNumber = 5;
      sinon.stub(progressInAssessment, 'getMaxStepsNumber').returns(expectedMaxStepsNumber);

      // when
      const maxStepsNumber = component.maxStepsNumber;

      // then
      assert.deepEqual(maxStepsNumber, expectedMaxStepsNumber);
    });
  });

  module('@currentStepNumber', function () {
    test('should return the currentStepNumber from service', function (assert) {
      // given
      const expectedCurrentStepNumber = 3;
      sinon.stub(progressInAssessment, 'getCurrentStepNumber').returns(expectedCurrentStepNumber);

      // when
      const currentStepNumber = component.currentStepNumber;

      // then
      assert.deepEqual(currentStepNumber, expectedCurrentStepNumber);
    });
  });

  module('@steps', function () {
    test('should return the steps specifics', function (assert) {
      // given
      sinon.stub(progressInAssessment, 'getCurrentStepIndex').returns(2);
      sinon.stub(progressInAssessment, 'getMaxStepsNumber').returns(4);

      // when
      const steps = component.steps;

      // then
      assert.deepEqual(steps, [
        { stepnum: 1, status: 'active', background: htmlSafe('background: #4f5fff;') },
        { stepnum: 2, status: 'active', background: htmlSafe('background: #6256ff;') },
        { stepnum: 3, status: 'active', background: htmlSafe('background: #754dff;') },
        { stepnum: 4, status: '', background: htmlSafe('background: #8845ff;') },
      ]);
    });
  });

  module('@progressionWidth', function () {
    test('should return the progressionWidth', function (assert) {
      // given
      sinon.stub(progressInAssessment, 'getCurrentStepIndex').returns(2);
      sinon.stub(progressInAssessment, 'getMaxStepsNumber').returns(5);
      // when
      const progressionWidth = component.progressionWidth;

      // then
      assert.deepEqual(progressionWidth, htmlSafe('width: 50.85%;'));
    });

    test('should return the initial progressionWidth', function (assert) {
      // given
      sinon.stub(progressInAssessment, 'getCurrentStepIndex').returns(0);
      sinon.stub(progressInAssessment, 'getMaxStepsNumber').returns(5);

      // when
      const progressionWidth = component.progressionWidth;

      // then
      assert.deepEqual(progressionWidth, htmlSafe('width: 16px;'));
    });
  });
});
