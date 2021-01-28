import { afterEach, beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';
import sinon from 'sinon';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';
import { expect } from 'chai';

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
      controller.model = {
        assessment: {},
        answer: null,
      };
      sinon.stub(progressInAssessment, 'getCurrentStepNumber').returns(2);
      sinon.stub(progressInAssessment, 'getMaxStepsNumber').returns(5);

      // when
      controller.pageTitle;

      // then
      sinon.assert.calledWith(intl.t, 'pages.challenge.title', { stepNumber: 2, totalChallengeNumber: 5 });
    });
  });

  describe('#displayHomeLink', () => {
    it('should not display home link', function() {
      // given
      controller.currentUser = Service.create({ user: { isAnonymous: true } });

      // then
      expect(controller.displayHomeLink).to.be.false;
    });

    it('should display home link', function() {
      // given
      controller.currentUser = Service.create({ user: { isAnonymous: false } });

      // then
      expect(controller.displayHomeLink).to.be.true;
    });
  });

});
