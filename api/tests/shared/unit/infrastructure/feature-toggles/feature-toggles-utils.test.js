import { expect } from 'chai';
import sinon from 'sinon';

import { config } from '../../../../../config/config.js';
import {
  getFeatureTogglesEnvironment,
  isEnabledByContainerRatio,
} from '../../../../../src/shared/infrastructure/feature-toggles/feature-toggles-utils.js';

describe('Unit | Infrastructure | Feature Toggles | Utils', function () {
  describe('isEnabledByContainerRatio', function () {
    [
      ['0/1', 'web-1', false],
      ['0/1', 'web-2', false],
      ['0/1', 'web-10', false],
      ['1/1', 'web-1', true],
      ['1/1', 'web-2', true],
      ['1/1', 'web-10', true],
      ['1/2', 'web-1', true],
      ['1/2', 'web-2', false],
      ['1/2', 'web-3', true],
      ['1/2', 'web-4', false],
      ['1/2', 'web-10', false],
      ['1/2', 'web-11', true],
      ['1/3', 'web-1', true],
      ['1/3', 'web-2', false],
      ['1/3', 'web-3', false],
      ['1/3', 'web-4', true],
      ['1/3', 'web-5', false],
      ['1/3', 'web-6', false],
      ['2/3', 'web-1', true],
      ['2/3', 'web-2', true],
      ['2/3', 'web-3', false],
      ['2/3', 'web-4', true],
      ['2/3', 'web-5', true],
      ['2/3', 'web-6', false],
    ].forEach(([featureToggleValue, containerName, expectedValue]) => {
      describe(`when feature toggle value is ${featureToggleValue} and container name is ${containerName}`, function () {
        it(`returns ${expectedValue}`, async function () {
          // given
          sinon.stub(config.infra, 'containerName').value(containerName);

          // when
          const value = isEnabledByContainerRatio(featureToggleValue);

          // then
          expect(value).to.equal(expectedValue);
        });
      });
    });
  });

  describe('getFeatureTogglesEnvironment', function () {
    [
      { isTestEnv: true, isE2eTests: false, isReviewApp: false, expected: 'test' },
      { isTestEnv: false, isE2eTests: true, isReviewApp: false, expected: 'test' },
      { isTestEnv: false, isE2eTests: true, isReviewApp: true, expected: 'test' },
      { isTestEnv: false, isE2eTests: false, isReviewApp: true, expected: 'reviewApp' },
      { isTestEnv: false, isE2eTests: false, isReviewApp: false, expected: undefined },
    ].forEach(({ isTestEnv, isE2eTests, isReviewApp, expected }) => {
      it(`returns ${expected} when isTestEnv=${isTestEnv}, isE2eTests=${isE2eTests}, isReviewApp=${isReviewApp}`, function () {
        // when
        const environment = getFeatureTogglesEnvironment({ isTestEnv, isE2eTests, isReviewApp });

        // then
        expect(environment).to.equal(expected);
      });
    });
  });
});
