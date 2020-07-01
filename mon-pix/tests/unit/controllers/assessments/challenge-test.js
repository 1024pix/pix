import { expect } from 'chai';
import { beforeEach, afterEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';

describe('Unit | Controller | Assessments | Challenge', function() {

  setupTest();

  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:assessments/challenge');
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('#pageTitle', () => {
    it('should return Épreuve 2 sur 5', function() {
      const model = {
        assessment: {},
        answer: null,
      };
      controller.model = model;
      sinon.stub(progressInAssessment, 'getCurrentStepNumber').returns(2);
      sinon.stub(progressInAssessment, 'getMaxStepsNumber').returns(5);

      // then
      expect(controller.pageTitle).to.equal('Épreuve 2 sur 5');
    });
  });

});
