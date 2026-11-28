import { expect } from 'chai';

import {
  countTrailingFailures,
  getProbabilityBelowThreshold,
  hasConsecutiveFailures,
  isCapacityProbablyBelowThreshold,
  normalCdf,
  shouldStopEarly,
} from '../../../../../../../src/certification/evaluation/domain/services/algorithm-methods/early-stop.js';
import { AnswerStatus } from '../../../../../../../src/shared/domain/models/AnswerStatus.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

const ok = () => domainBuilder.buildAnswer({ result: AnswerStatus.OK });
const ko = () => domainBuilder.buildAnswer({ result: AnswerStatus.KO });

describe('Unit | Certification | Evaluation | Domain | Service | Algorithm-methods | early-stop', function () {
  describe('#normalCdf', function () {
    [
      { z: 0, expected: 0.5 },
      { z: 1.645, expected: 0.95 },
      { z: -1.96, expected: 0.025 },
      { z: 1.96, expected: 0.975 },
      { z: -8, expected: 0 },
      { z: 8, expected: 1 },
    ].forEach(({ z, expected }) => {
      it(`should return ${expected} for z = ${z}`, function () {
        // when
        const result = normalCdf(z);

        // then
        expect(result).to.be.closeTo(expected, 1e-3);
      });
    });
  });

  describe('#countTrailingFailures', function () {
    it('should return 0 when there is no answer', function () {
      // when
      const result = countTrailingFailures([]);

      // then
      expect(result).to.equal(0);
    });

    it('should return 0 when the last answer is ok', function () {
      // when
      const result = countTrailingFailures([ko(), ko(), ok()]);

      // then
      expect(result).to.equal(0);
    });

    it('should count only the failures after the last ok answer', function () {
      // when
      const result = countTrailingFailures([ko(), ok(), ko(), ko(), ko()]);

      // then
      expect(result).to.equal(3);
    });

    it('should count all answers when every answer is a failure', function () {
      // when
      const result = countTrailingFailures([ko(), ko()]);

      // then
      expect(result).to.equal(2);
    });

    it('should count skipped answers as failures', function () {
      // given
      const skipped = domainBuilder.buildAnswer({ result: AnswerStatus.SKIPPED });

      // when
      const result = countTrailingFailures([ok(), skipped, ko()]);

      // then
      expect(result).to.equal(2);
    });
  });

  describe('#getProbabilityBelowThreshold', function () {
    it('should return 0.5 when capacity equals the threshold', function () {
      // when
      const result = getProbabilityBelowThreshold({ capacity: -4, errorRate: 0.5, threshold: -4 });

      // then
      expect(result).to.be.closeTo(0.5, 1e-6);
    });

    it('should return about 0.95 when capacity is 1.645 standard deviations below the threshold', function () {
      // when
      const result = getProbabilityBelowThreshold({ capacity: -5.645, errorRate: 1, threshold: -4 });

      // then
      expect(result).to.be.closeTo(0.95, 1e-3);
    });

    context('when errorRate is not a positive number', function () {
      [NaN, 0, -1].forEach((errorRate) => {
        it(`should still return a probability for errorRate = ${errorRate}`, function () {
          // when
          const result = getProbabilityBelowThreshold({ capacity: -5, errorRate, threshold: -4 });

          // then
          expect(result).to.be.closeTo(1, 1e-6);
        });
      });
    });
  });

  describe('#hasConsecutiveFailures', function () {
    it('should return true when trailing failures reach the expected count', function () {
      // when
      const result = hasConsecutiveFailures({ answers: [ok(), ko(), ko(), ko()], consecutiveFailures: 3 });

      // then
      expect(result).to.be.true;
    });

    it('should return false when trailing failures are below the expected count', function () {
      // when
      const result = hasConsecutiveFailures({ answers: [ko(), ok(), ko(), ko()], consecutiveFailures: 3 });

      // then
      expect(result).to.be.false;
    });
  });

  describe('#isCapacityProbablyBelowThreshold', function () {
    it('should return true when the probability reaches the confidence', function () {
      // when
      const result = isCapacityProbablyBelowThreshold({
        capacity: -6,
        errorRate: 0.5,
        capacityThreshold: -4.67,
        confidence: 0.95,
      });

      // then
      expect(result).to.be.true;
    });

    it('should return false when the probability is below the confidence', function () {
      // when
      const result = isCapacityProbablyBelowThreshold({
        capacity: -5,
        errorRate: 0.5,
        capacityThreshold: -4.67,
        confidence: 0.95,
      });

      // then
      expect(result).to.be.false;
    });
  });

  describe('#shouldStopEarly', function () {
    const lowCapacity = { capacity: -6, errorRate: 0.5 };
    const thresholdCapacity = { capacity: -4.67, errorRate: 0.5 };
    const rule = { consecutiveFailures: 3, minimumLength: 5, capacityThreshold: -4.67, confidence: 0.95 };

    it('should return true when there are enough consecutive failures and capacity is probably low', function () {
      // when
      const result = shouldStopEarly({ answers: [ok(), ok(), ko(), ko(), ko()], ...lowCapacity, ...rule });

      // then
      expect(result).to.be.true;
    });

    it('should return false when there are not enough answers', function () {
      // when
      const result = shouldStopEarly({ answers: [ko(), ko(), ko(), ko()], ...lowCapacity, ...rule });

      // then
      expect(result).to.be.false;
    });

    it('should return false when there are not enough consecutive failures', function () {
      // when
      const result = shouldStopEarly({ answers: [ko(), ko(), ko(), ok(), ko()], ...lowCapacity, ...rule });

      // then
      expect(result).to.be.false;
    });

    it('should return false when capacity is not probably below the threshold', function () {
      // when
      const result = shouldStopEarly({ answers: [ko(), ko(), ko(), ko(), ko()], ...thresholdCapacity, ...rule });

      // then
      expect(result).to.be.false;
    });
  });
});
