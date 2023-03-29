import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';

module('Unit | Controller | Assessments | Challenge', function (hooks) {
  setupTest(hooks);

  let controller;
  const intl = Service.create({ t: sinon.spy() });

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:assessments/challenge');
    controller.intl = intl;
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('#pageTitle', function () {
    test('should return Épreuve 2 sur 5', function (assert) {
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
      assert.ok(true);
    });

    test('should return focused title when challenge is focused', function (assert) {
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
      assert.ok(true);
    });
  });

  module('#displayHomeLink', function () {
    test('should not display home link', function (assert) {
      // given
      controller.currentUser = Service.create({ user: { isAnonymous: true } });

      // then
      assert.false(controller.displayHomeLink);
    });

    test('should display home link', function (assert) {
      // given
      controller.currentUser = Service.create({ user: { isAnonymous: false } });

      // then
      assert.true(controller.displayHomeLink);
    });
  });

  module('#showLevelup', function () {
    test('should display level up pop-in', function (assert) {
      // given
      controller.newLevel = true;
      const model = { assessment: { showLevelup: true } };
      controller.model = model;

      // then
      assert.true(controller.showLevelup);
    });

    test('should not display level up pop-in when user has not leveled up', function (assert) {
      // given
      controller.newLevel = false;
      const model = { assessment: { showLevelup: true } };
      controller.model = model;

      // then
      assert.false(controller.showLevelup);
    });

    test('should not display level up pop-in when it is not in assessment with level up', function (assert) {
      // given
      controller.newLevel = true;
      const model = { assessment: { showLevelup: false } };
      controller.model = model;

      // then
      assert.false(controller.showLevelup);
    });
  });

  module('#displayChallenge', function () {
    module('when challenge is focused and assessment is of type certification', function () {
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

        test(`should be ${data.expectedResult} when ${_hasUserConfirmedCertificationFocusWarning}, ${_hasAnswer}`, function (assert) {
          // given
          const focusedCertificationChallengeWarningManager = this.owner.lookup(
            'service:focused-certification-challenge-warning-manager'
          );
          focusedCertificationChallengeWarningManager._hasConfirmedFocusChallengeScreen =
            data.hasUserConfirmedCertificationFocusWarning;

          const challenge = {
            id: 'rec_123',
            timer: undefined,
            focused: true,
          };

          const answer = data.answer;

          const assessment = { isCertification: true };

          controller.model = { challenge, answer, assessment };

          // when
          const result = controller.displayChallenge;

          // then
          assert.strictEqual(result, data.expectedResult);
        });
      });
    });
    module('when challenge is not focused and has no timer', function () {
      [
        { answer: undefined, hasUserConfirmedTimedChallengeWarning: false, expectedResult: true },
        { answer: 'banana', hasUserConfirmedTimedChallengeWarning: false, expectedResult: true },
      ].forEach((data) => {
        const _hasUserConfirmedWarning = data.hasUserConfirmedTimedChallengeWarning
          ? 'user has confirmed warning'
          : 'user has not confirmed warning';
        const _hasAnswer = data.answer ? 'user has already answered' : 'user has not answered the question';

        test(`should be ${data.expectedResult} when ${_hasUserConfirmedWarning}, ${_hasAnswer}`, function (assert) {
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
          assert.strictEqual(result, data.expectedResult);
        });
      });
    });

    module('when challenge has timer', function () {
      [
        { answer: undefined, hasUserConfirmedTimedChallengeWarning: true, expectedResult: true },
        { answer: 'banana', hasUserConfirmedTimedChallengeWarning: false, expectedResult: true },
        { answer: undefined, hasUserConfirmedTimedChallengeWarning: false, expectedResult: false },
      ].forEach((data) => {
        const _hasUserConfirmedWarning = data.hasUserConfirmedTimedChallengeWarning
          ? 'user has confirmed warning'
          : 'user has not confirmed warning';
        const _hasAnswer = data.answer ? 'user has already answered' : 'user has not answered the question';

        test(`should be ${data.expectedResult} when ${_hasUserConfirmedWarning}, ${_hasAnswer}`, function (assert) {
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
          assert.strictEqual(result, data.expectedResult);
        });
      });
    });
  });
});
