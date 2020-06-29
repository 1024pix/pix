import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { htmlSafe } from '@ember/string';
import sinon from 'sinon';

describe('Unit | Component | progress-bar', function() {

  setupTest();

  describe('@currentStepIndex', function() {
    it('should return the current step index from service', function() {
      // given
      const expectedCurrentStepIndex = 2;
      const component = this.owner.lookup('component:progress-bar');
      component.progressInAssessment = {
        getCurrentStepIndex: sinon.stub().returns(expectedCurrentStepIndex),
      };

      // when
      const currentStepNumber = component.get('currentStepIndex');

      // then
      expect(currentStepNumber).to.deep.equal(expectedCurrentStepIndex);
    });
  });

  describe('@maxStepsNumber', function() {

    it('should return the maxStepsNumber from service', function() {
      // given
      const expectedMaxStepsNumber = 5;
      const component = this.owner.lookup('component:progress-bar');
      component.progressInAssessment = {
        getMaxStepsNumber: sinon.stub().returns(expectedMaxStepsNumber),
      };

      // when
      const maxStepsNumber = component.get('maxStepsNumber');

      // then
      expect(maxStepsNumber).to.deep.equal(expectedMaxStepsNumber);
    });
  });

  describe('@currentStepNumber', function() {

    it('should return the currentStepNumber from service', function() {
      // given
      const expectedCurrentStepNumber = 3;
      const component = this.owner.lookup('component:progress-bar');
      component.progressInAssessment = {
        getCurrentStepNumber: sinon.stub().returns(expectedCurrentStepNumber),
      };

      // when
      const currentStepNumber = component.get('currentStepNumber');

      // then
      expect(currentStepNumber).to.deep.equal(expectedCurrentStepNumber);
    });
  });

  describe('@steps', function() {

    it('should return the steps specifics', function() {
      // given
      const component = this.owner.lookup('component:progress-bar');
      component.set('currentStepIndex', 2);
      component.set('maxStepsNumber', 4);

      // when
      const steps = component.get('steps');

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
      const component = this.owner.lookup('component:progress-bar');
      component.set('currentStepIndex', 2);
      component.set('maxStepsNumber', 5);

      // when
      const progressionWidth = component.get('progressionWidth');

      // then
      expect(progressionWidth).to.deep.equal(htmlSafe('width: 50.85%;'));
    });

    it('should return the initial progressionWidth', function() {
      // given
      const component = this.owner.lookup('component:progress-bar');
      component.set('currentStepIndex', 0);
      component.set('maxStepsNumber', 5);

      // when
      const progressionWidth = component.get('progressionWidth');

      // then
      expect(progressionWidth).to.deep.equal(htmlSafe('width: 16px;'));
    });
  });
});
