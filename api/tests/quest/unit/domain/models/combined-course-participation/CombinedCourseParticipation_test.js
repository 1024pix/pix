import sinon from 'sinon';

import { CombinedCourseParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourseParticipation } from '../../../../../../src/quest/domain/models/combined-course-participation/CombinedCourseParticipation.js';
import { expect } from '../../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | CombinedCourseParticipation ', function () {
  describe('complete', function () {
    let clock;
    const now = new Date('2025-07-07');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should set status to completed, and update date', function () {
      // given
      const combinedCourseParticipation = new CombinedCourseParticipation({
        id: 1,
        questId: 2,
        organizationLearnerId: 3,
        status: CombinedCourseParticipationStatuses.STARTED,
        updatedAt: new Date('2020-01-01'),
        createdAt: new Date('2020-01-01'),
      });

      // when
      combinedCourseParticipation.complete();

      // then
      expect(combinedCourseParticipation.isCompleted()).to.be.true;
      expect(combinedCourseParticipation.updatedAt).to.deep.equal(now);
    });
  });
});
