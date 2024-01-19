import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../../helpers/create-glimmer-component';

module('Unit | Component | certifications/certification/details-v3', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:certifications/certification/details-v3');
  });

  const answerStatusOptions = [
    { value: 'ok', label: 'pages.certifications.certification.details.v3.answer-status.ok', color: 'success' },
    { value: 'ko', label: 'pages.certifications.certification.details.v3.answer-status.ko', color: 'neutral' },
    {
      value: null,
      label: 'pages.certifications.certification.details.v3.answer-status.validated-live-alert',
      color: 'error',
    },
    { value: 'aband', label: 'pages.certifications.certification.details.v3.answer-status.aband', color: 'tertiary' },
  ];

  module('answerStatusLabel', function () {
    answerStatusOptions.forEach(({ value, label: expectedLabel }) => {
      test(`should return the ${expectedLabel} when the answer status is ${value}`, function (assert) {
        // when
        const label = component.answerStatusLabel(value);

        // then
        assert.strictEqual(label, expectedLabel);
      });
    });
  });

  module('answerStatusColor', function () {
    answerStatusOptions.forEach(({ value, color: expectedColor }) => {
      test(`should return the color ${expectedColor} when the answer status is ${value}`, function (assert) {
        // when
        const label = component.answerStatusColor(value);

        // then
        assert.strictEqual(label, expectedColor);
      });
    });
  });

  module('detailStatusLabel', function () {
    const detailsStatusOptions = [
      {
        details: {
          isRejectedForFraud: false,
          isCancelled: false,
          assessmentResultStatus: 'validated',
        },
        expectedValue: 'pages.certifications.certification.details.v3.assessment-result-status.validated',
      },
      {
        details: {
          isRejectedForFraud: false,
          isCancelled: false,
          assessmentResultStatus: 'rejected',
        },
        expectedValue: 'pages.certifications.certification.details.v3.assessment-result-status.rejected',
      },
      {
        details: {
          isRejectedForFraud: false,
          isCancelled: false,
          assessmentResultStatus: 'error',
        },
        expectedValue: 'pages.certifications.certification.details.v3.assessment-result-status.error',
      },
      {
        details: {
          isRejectedForFraud: false,
          isCancelled: true,
          assessmentResultStatus: 'validated',
        },
        expectedValue: 'pages.certifications.certification.details.v3.assessment-result-status.cancelled',
      },
      {
        details: {
          isRejectedForFraud: true,
          isCancelled: false,
          assessmentResultStatus: 'validated',
        },
        expectedValue: 'pages.certifications.certification.details.v3.assessment-result-status.fraud',
      },
    ];
    detailsStatusOptions.forEach(({ expectedValue, details }) => {
      test(`should return the detail status ${expectedValue} when the assessmentResult is validated`, function (assert) {
        //given
        component.args.details = details;

        // when
        const label = component.detailStatusLabel;

        // then
        assert.strictEqual(label, expectedValue);
      });
    });
  });

  module('detailStatusColor', function () {
    const detailsStatusOptions = [
      {
        details: {
          isRejectedForFraud: false,
          isCancelled: false,
          assessmentResultStatus: 'validated',
        },
        expectedValue: 'success',
      },
      {
        details: {
          isRejectedForFraud: false,
          isCancelled: false,
          assessmentResultStatus: 'rejected',
        },
        expectedValue: 'error',
      },
      {
        details: {
          isRejectedForFraud: false,
          isCancelled: false,
          assessmentResultStatus: 'error',
        },
        expectedValue: 'error',
      },
      {
        details: {
          isRejectedForFraud: false,
          isCancelled: true,
          assessmentResultStatus: 'validated',
        },
        expectedValue: 'error',
      },
      {
        details: {
          isRejectedForFraud: true,
          isCancelled: false,
          assessmentResultStatus: 'validated',
        },
        expectedValue: 'error',
      },
    ];
    detailsStatusOptions.forEach(({ expectedValue, details }) => {
      test(`should return the detail status ${expectedValue} when the assessmentResult is validated`, function (assert) {
        //given
        component.args.details = details;

        // when
        const label = component.detailStatusColor;

        // then
        assert.strictEqual(label, expectedValue);
      });
    });
  });

  module('durationTagColor', function () {
    const durationTagColorOptions = [
      {
        details: {
          hasExceededTimeLimit: false,
        },
        expectedValue: 'success',
      },
      {
        details: {
          hasExceededTimeLimit: true,
        },
        expectedValue: 'error',
      },
    ];
    durationTagColorOptions.forEach(({ expectedValue, details }) => {
      test(`should return the detail status ${expectedValue} when the assessmentResult is validated`, function (assert) {
        //given
        component.args.details = details;

        // when
        const label = component.durationTagColor;

        // then
        assert.strictEqual(label, expectedValue);
      });
    });
  });

  module('shouldDisplayAnswerStatus', function () {
    const certificationChallengeOptions = [
      {
        certificationChallenge: {
          answeredAt: new Date(),
          validatedLiveAlert: Symbol('validatedLiveAlert'),
        },
        expectedValue: true,
      },
      {
        certificationChallenge: {
          answeredAt: null,
          validatedLiveAlert: Symbol('validatedLiveAlert'),
        },
        expectedValue: true,
      },
      {
        certificationChallenge: {
          answeredAt: new Date(),
          validatedLiveAlert: null,
        },
        expectedValue: true,
      },
      {
        certificationChallenge: {
          answeredAt: null,
          validatedLiveAlert: null,
        },
        expectedValue: false,
      },
    ];

    certificationChallengeOptions.forEach(({ expectedValue, certificationChallenge }) => {
      test(`when answeredAt is ${certificationChallenge.answeredAt} and answerStatus is ${certificationChallenge.answerStatus} should return ${expectedValue}`, function (assert) {
        // when
        const displayAnswerStatus = component.shouldDisplayAnswerStatus(certificationChallenge);

        //then
        assert.strictEqual(displayAnswerStatus, expectedValue);
      });
    });
  });

  module('shouldDisplayAnswerValueIcon', function () {
    let certificationChallenge;

    test('should display the answer icon when there is an answer status AND no live alert', function (assert) {
      certificationChallenge = {
        answerStatus: 'ok',
        validatedLiveAlert: null,
      };
      // when
      const displayAnswerIcon = component.shouldDisplayAnswerValueIcon(certificationChallenge);

      //then
      assert.true(displayAnswerIcon);
    });

    test('should NOT display the answer icon when there is NO answer status', function (assert) {
      certificationChallenge = {
        answerStatus: null,
        validatedLiveAlert: null,
      };
      // when
      const displayAnswerIcon = component.shouldDisplayAnswerValueIcon(certificationChallenge);

      //then
      assert.false(displayAnswerIcon);
    });

    test('should NOT display the answer icon when there answer status is aband', function (assert) {
      certificationChallenge = {
        answerStatus: 'aband',
        validatedLiveAlert: null,
      };
      // when
      const displayAnswerIcon = component.shouldDisplayAnswerValueIcon(certificationChallenge);

      //then
      assert.false(displayAnswerIcon);
    });

    test('should NOT display the answer icon when there is a live alert', function (assert) {
      certificationChallenge = {
        answerStatus: null,
        validatedLiveAlert: { id: 123 },
      };
      // when
      const displayAnswerIcon = component.shouldDisplayAnswerValueIcon(certificationChallenge);

      //then
      assert.false(displayAnswerIcon);
    });
  });

  module('shouldDisplayEndedByBlock', function () {
    test('should display the endedBy block when the certification has NOT been ended by the candidate', function (assert) {
      component.args.details = {
        hasNotBeenCompletedByCandidate: true,
      };
      // when
      const displayEndedByBlock = component.shouldDisplayEndedByBlock;

      //then
      assert.true(displayEndedByBlock);
    });

    test('should NOT display the endedBy block when the certification has been ended by the candidate', function (assert) {
      component.args.details = {
        hasNotBeenCompletedByCandidate: false,
      };
      // when
      const displayEndedByBlock = component.shouldDisplayEndedByBlock;

      //then
      assert.false(displayEndedByBlock);
    });
  });
});
