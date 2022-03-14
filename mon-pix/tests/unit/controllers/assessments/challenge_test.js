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
        challenge: {
          focused: false,
        },
      };
      sinon.stub(progressInAssessment, 'getCurrentStepNumber').returns(2);
      sinon.stub(progressInAssessment, 'getMaxStepsNumber').returns(5);

      // when
      controller.pageTitle;

      // then
      sinon.assert.calledWith(intl.t, 'pages.challenge.title.default', { stepNumber: 2, totalChallengeNumber: 5 });
    });

    it('should return focused title when challenge is focused', function () {
      // given
      controller.model = {
        assessment: {},
        answer: null,
        challenge: {
          focused: true,
        },
      };
      sinon.stub(progressInAssessment, 'getCurrentStepNumber').returns(2);
      sinon.stub(progressInAssessment, 'getMaxStepsNumber').returns(5);

      // when
      controller.pageTitle;

      // then
      sinon.assert.calledWith(intl.t, 'pages.challenge.title.focused', { stepNumber: 2, totalChallengeNumber: 5 });
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
    context('when challenge is focused and assessment is of type certification', function () {
      [
        {
          answer: undefined,
          hasUserConfirmedCertificationFocusWarning: false,
          expectedResult: false,
        },
        {
          answer: undefined,
          hasUserConfirmedCertificationFocusWarning: true,
          expectedResult: true,
        },
        {
          answer: 'toto',
          hasUserConfirmedCertificationFocusWarning: true,
          expectedResult: true,
        },
      ].forEach((data) => {
        const _hasUserConfirmedCertificationFocusWarning = data.hasUserConfirmedCertificationFocusWarning
          ? 'user has confirmed certification focus warning'
          : 'user has not confirmed certification focus warning';
        const _hasAnswer = data.answer ? 'user has already answered' : 'user has not answered the question';

        it(`should be ${data.expectedResult} when ${_hasUserConfirmedCertificationFocusWarning}, ${_hasAnswer}`, function () {
          // given
          const focusedCertificationChallengeManager = this.owner.lookup(
            'service:focused-certification-challenges-manager'
          );
          sinon
            .stub(focusedCertificationChallengeManager, 'has')
            .returns(data.hasUserConfirmedCertificationFocusWarning);

          const challenge = {
            id: 'rec_123',
            timer: undefined,
            focused: true,
          };

          const answer = data.answer;

          const assessment = { isCertification: true };

          controller.model = { challenge, answer, assessment };
          controller.hasUserConfirmedCertificationFocusWarning = data.hasUserConfirmedCertificationFocusWarning;

          // when
          const result = controller.displayChallenge;

          // then
          expect(result).to.equal(data.expectedResult);
        });
      });
    });
    context('when challenge is not focused and has no timer', function () {
      [
        { answer: undefined, hasUserConfirmedTimedChallengeWarning: false, expectedResult: true },
        { answer: 'banana', hasUserConfirmedTimedChallengeWarning: false, expectedResult: true },
      ].forEach((data) => {
        const _hasUserConfirmedWarning = data.hasUserConfirmedTimedChallengeWarning
          ? 'user has confirmed warning'
          : 'user has not confirmed warning';
        const _hasAnswer = data.answer ? 'user has already answered' : 'user has not answered the question';

        it(`should be ${data.expectedResult} when ${_hasUserConfirmedWarning}, ${_hasAnswer}`, function () {
          // given
          const challenge = {
            id: 'rec_123',
            timer: undefined,
            focused: false,
          };

          const answer = data.answer;

          const assessment = {};

          controller.model = { challenge, answer, assessment };
          controller.hasUserConfirmedTimedChallengeWarning = data.hasUserConfirmedTimedChallengeWarning;

          // when
          const result = controller.displayChallenge;

          // then
          expect(result).to.equal(data.expectedResult);
        });
      });
    });

    context('when challenge has timer', function () {
      [
        { answer: undefined, hasUserConfirmedTimedChallengeWarning: true, expectedResult: true },
        { answer: 'banana', hasUserConfirmedTimedChallengeWarning: false, expectedResult: true },
        { answer: undefined, hasUserConfirmedTimedChallengeWarning: false, expectedResult: false },
      ].forEach((data) => {
        const _hasUserConfirmedWarning = data.hasUserConfirmedTimedChallengeWarning
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
          controller.hasUserConfirmedTimedChallengeWarning = data.hasUserConfirmedTimedChallengeWarning;

          // when
          const result = controller.displayChallenge;

          // then
          expect(result).to.equal(data.expectedResult);
        });
      });
    });
  });
});
