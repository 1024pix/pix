import { beforeEach, afterEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';
import sinon from 'sinon';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';

describe('Unit | Controller | Assessments | Challenge', function() {

  setupTest();

  let controller;
  const intl = Service.create({ t: sinon.spy() });

  beforeEach(function() {
    controller = this.owner.lookup('controller:assessments/challenge');
    controller.intl = intl;
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('#pageTitle', () => {
    it('should return Épreuve 2 sur 5', function() {
      // given
      const model = {
        assessment: {},
        answer: null,
      };
      controller.model = model;
      sinon.stub(progressInAssessment, 'getCurrentStepNumber').returns(2);
      sinon.stub(progressInAssessment, 'getMaxStepsNumber').returns(5);

      // when
      controller.pageTitle;

      // then
      sinon.assert.calledWith(intl.t, 'pages.challenge.title', { stepNumber: 2, totalChallengeNumber: 5 });
    });
  });

});
