import { expect } from 'chai';

import {
  countTrailingFailures,
  normalCdf,
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
});
