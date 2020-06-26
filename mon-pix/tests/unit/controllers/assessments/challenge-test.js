import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | Assessments | Challenge', function() {

  setupTest();

  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:assessments/challenge');
  });

  describe('#pageTitle', () => {
    it('should return Épreuve 2 sur 5', function() {
      const model = {
        assessment: {},
        answer: null,
      };
      controller.model = model;
      controller.progressInEvaluation = {
        getCurrentStepIndex: sinon.stub().returns(1),
        getMaxStepsNumber: sinon.stub().returns(5)
      };

      // then
      expect(controller.pageTitle).to.equal('Épreuve 2 sur 5');
    });
  });

});
