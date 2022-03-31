import { afterEach, beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';
import sinon from 'sinon';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';
import { expect } from 'chai';

describe('Unit | Controller | Assessments | Challenge', function () {
  setupTest();

  let controller;
  const intl = Service.create({ t: sinon.spy() });

  beforeEach(function () {
    controller = this.owner.lookup('controller:assessments/challenge');
    controller.intl = intl;
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('#pageTitle', () => {
    it('should return Épreuve 2 sur 5', function () {
      // given
      controller.model = {
        assessment: {},
        answer: null,
        challenge: {},
      };
      sinon.stub(progressInAssessment, 'getCurrentStepNumber').returns(2);
      sinon.stub(progressInAssessment, 'getMaxStepsNumber').returns(5);

      // when
      controller.pageTitle;

      // then
      sinon.assert.calledWith(intl.t, 'pages.challenge.title.default', { stepNumber: 2, totalChallengeNumber: 5 });
    });
  });

  describe('#displayHomeLink', () => {
    it('should not display home link', function () {
      // given
      controller.currentUser = Service.create({ user: { isAnonymous: true } });

      // then
      expect(controller.displayHomeLink).to.be.false;
    });

    it('should display home link', function () {
      // given
      controller.currentUser = Service.create({ user: { isAnonymous: false } });

      // then
      expect(controller.displayHomeLink).to.be.true;
    });
  });

  describe('#showLevelup', () => {
    it('should display level up pop-in', function () {
      // given
      controller.newLevel = true;
      const model = { assessment: { showLevelup: true } };
      controller.model = model;

      // then
      expect(controller.showLevelup).to.be.true;
    });

    it('should not display level up pop-in when user has not leveled up', function () {
      // given
      controller.newLevel = false;
      const model = { assessment: { showLevelup: true } };
      controller.model = model;

      // then
      expect(controller.showLevelup).to.be.false;
    });

    it('should not display level up pop-in when it is not in assessment with level up', function () {
      // given
      controller.newLevel = true;
      const model = { assessment: { showLevelup: false } };
      controller.model = model;

      // then
      expect(controller.showLevelup).to.be.false;
    });
  });

  describe('#displayChallenge', function () {
    context('when challenge has no timer', function () {
      [
        { answer: undefined, hasUserConfirmedWarning: false, expectedResult: true },
        { answer: 'banana', hasUserConfirmedWarning: false, expectedResult: true },
      ].forEach((data) => {
        const _hasUserConfirmedWarning = data.hasUserConfirmedWarning
          ? 'user has confirmed warning'
          : 'user has not confirmed warning';
        const _hasAnswer = data.answer ? 'user has already answered' : 'user has not answered the question';

        it(`should be ${data.expectedResult} when ${_hasUserConfirmedWarning}, ${_hasAnswer}`, function () {
          // given
          const challenge = {
            id: 'rec_123',
            timer: undefined,
          };

          const answer = data.answer;

          const assessment = {};

          controller.model = { challenge, answer, assessment };
          controller.hasUserConfirmedWarning = data.hasUserConfirmedWarning;

          // when
          const result = controller.displayChallenge;

          // then
          expect(result).to.equal(data.expectedResult);
        });
      });
    });

    context('when challenge has timer', function () {
      [
        { answer: undefined, hasUserConfirmedWarning: true, expectedResult: true },
        { answer: 'banana', hasUserConfirmedWarning: false, expectedResult: true },
        { answer: undefined, hasUserConfirmedWarning: false, expectedResult: false },
      ].forEach((data) => {
        const _hasUserConfirmedWarning = data.hasUserConfirmedWarning
          ? 'user has confirmed warning'
          : 'user has not confirmed warning';
        const _hasAnswer = data.answer ? 'user has already answered' : 'user has not answered the question';

        it(`should be ${data.expectedResult} when ${_hasUserConfirmedWarning}, ${_hasAnswer}`, function () {
          // given
          const challenge = {
            id: 'rec_123',
            timer: 55,
          };

          const answer = data.answer;
          const assessment = {};

          controller.model = { challenge, answer, assessment };
          controller.hasUserConfirmedWarning = data.hasUserConfirmedWarning;

          // when
          const result = controller.displayChallenge;

          // then
          expect(result).to.equal(data.expectedResult);
        });
      });
    });
  });
});
