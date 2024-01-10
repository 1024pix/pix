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
    { value: 'ok', label: 'OK', color: 'success' },
    { value: 'ko', label: 'KO', color: 'neutral' },
    { value: null, label: 'Signalement validé', color: 'error' },
    { value: 'aband', label: 'Abandonnée', color: 'tertiary' },
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
        expectedValue: 'Validée',
      },
      {
        details: {
          isRejectedForFraud: false,
          isCancelled: false,
          assessmentResultStatus: 'rejected',
        },
        expectedValue: 'Rejetée',
      },
      {
        details: {
          isRejectedForFraud: false,
          isCancelled: false,
          assessmentResultStatus: 'error',
        },
        expectedValue: 'Erreur',
      },
      {
        details: {
          isRejectedForFraud: false,
          isCancelled: true,
          assessmentResultStatus: 'validated',
        },
        expectedValue: 'Annulée',
      },
      {
        details: {
          isRejectedForFraud: true,
          isCancelled: false,
          assessmentResultStatus: 'validated',
        },
        expectedValue: 'Rejetée pour fraude',
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
});
