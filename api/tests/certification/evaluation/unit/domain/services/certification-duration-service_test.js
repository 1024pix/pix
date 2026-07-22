import sinon from 'sinon';

import { isDurationExceeded } from '../../../../../../src/certification/evaluation/domain/services/certification-duration-service.js';
import { expect } from '../../../../../test-helper.js';

const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

describe('Unit | Certification | Evaluation | Domain | Service | certification-duration', function () {
  describe('#isDurationExceeded', function () {
    let clock;
    const now = new Date('2026-01-02T00:00:00Z');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('returns true when the elapsed duration exceeds 24 hours by one millisecond', function () {
      // given
      const startDate = new Date(now.getTime() - TWENTY_FOUR_HOURS_IN_MS - 1);

      // when
      const result = isDurationExceeded(startDate);

      // then
      expect(result).to.be.true;
    });

    it('returns false when exactly 24 hours have elapsed since the start date', function () {
      // given
      const startDate = new Date(now.getTime() - TWENTY_FOUR_HOURS_IN_MS);

      // when
      const result = isDurationExceeded(startDate);

      // then
      expect(result).to.be.false;
    });

    it('returns false when less than 24 hours have elapsed since the start date', function () {
      // given
      const startDate = new Date(now.getTime() - (TWENTY_FOUR_HOURS_IN_MS - 1));

      // when
      const result = isDurationExceeded(startDate);

      // then
      expect(result).to.be.false;
    });
  });
});
