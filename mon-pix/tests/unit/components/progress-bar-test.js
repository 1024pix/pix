import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { htmlSafe } from '@ember/string';
import sinon from 'sinon';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | progress-bar', function() {

  setupTest();
  let component;

  beforeEach(function() {
    component = createGlimmerComponent('component:progress-bar');
  });

  describe('@currentStepIndex', function() {
    it('should return the current step index from service', function() {
      // given
      const expectedCurrentStepIndex = 2;
      component.progressInAssessment = {
        getCurrentStepIndex: sinon.stub().returns(expectedCurrentStepIndex),
      };

      // when
      const currentStepNumber = component.currentStepIndex;

      // then
      expect(currentStepNumber).to.deep.equal(expectedCurrentStepIndex);
    });
  });

  describe('@maxStepsNumber', function() {

    it('should return the maxStepsNumber from service', function() {
      // given
      const expectedMaxStepsNumber = 5;
      component.progressInAssessment = {
        getMaxStepsNumber: sinon.stub().returns(expectedMaxStepsNumber),
      };

      // when
      const maxStepsNumber = component.maxStepsNumber;

      // then
      expect(maxStepsNumber).to.deep.equal(expectedMaxStepsNumber);
    });
  });

  describe('@currentStepNumber', function() {

    it('should return the currentStepNumber from service', function() {
      // given
      const expectedCurrentStepNumber = 3;
      component.progressInAssessment = {
        getCurrentStepNumber: sinon.stub().returns(expectedCurrentStepNumber),
      };

      // when
      const currentStepNumber = component.currentStepNumber;

      // then
      expect(currentStepNumber).to.deep.equal(expectedCurrentStepNumber);
    });
  });

  describe('@steps', function() {

    it('should return the steps specifics', function() {
      // given
      component.progressInAssessment = {
        getCurrentStepIndex: sinon.stub().returns(2),
        getMaxStepsNumber: sinon.stub().returns(4),
      };

      // when
      const steps = component.steps;

      // then
      expect(steps).to.deep.equal([
        { stepnum: 1, status: 'active', background: htmlSafe('background: #507fff;') },
        { stepnum: 2, status: 'active', background: htmlSafe('background: #6874ff;') },
        { stepnum: 3, status: 'active', background: htmlSafe('background: #8069ff;') },
        { stepnum: 4, status: '', background: htmlSafe('background: #985fff;') },
      ]);
    });
  });

  describe('@progressionWidth', function() {

    it('should return the progressionWidth', function() {
      // given
      component.progressInAssessment = {
        getCurrentStepIndex: sinon.stub().returns(2),
        getMaxStepsNumber: sinon.stub().returns(5),
      };

      // when
      const progressionWidth = component.progressionWidth;

      // then
      expect(progressionWidth).to.deep.equal(htmlSafe('width: 50.85%;'));
    });

    it('should return the initial progressionWidth', function() {
      // given
      component.progressInAssessment = {
        getCurrentStepIndex: sinon.stub().returns(0),
        getMaxStepsNumber: sinon.stub().returns(5),
      };

      // when
      const progressionWidth = component.progressionWidth;

      // then
      expect(progressionWidth).to.deep.equal(htmlSafe('width: 16px;'));
    });
  });
});
