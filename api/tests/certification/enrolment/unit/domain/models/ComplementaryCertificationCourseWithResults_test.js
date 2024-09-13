import { ComplementaryCertificationCourseWithResults } from '../../../../../../src/certification/enrolment/domain/models/ComplementaryCertificationCourseWithResults.js';
import { sources } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | ComplementaryCertificationCourseWithResults', function () {
  describe('#isAcquiredExpectedLevelByPixSource', function () {
    context(' on expected level', function () {
      describe('when the certification is acquired by PIX', function () {
        it('should return true', function () {
          // given
          const complementaryCertificationCourseWithResults = new ComplementaryCertificationCourseWithResults({
            complementaryCertificationBadgeId: 3,
            results: [{ complementaryCertificationBadgeId: 3, source: sources.PIX, acquired: true }],
          });

          // when
          const result = complementaryCertificationCourseWithResults.isAcquiredExpectedLevelByPixSource();

          // then
          expect(result).to.be.true;
        });
      });

      describe('when the certification is not acquired by PIX', function () {
        it('should return false', function () {
          // given
          const complementaryCertificationCourseWithResults = new ComplementaryCertificationCourseWithResults({
            complementaryCertificationBadgeId: 4,
            results: [{ complementaryCertificationBadgeId: 4, source: sources.EXTERNAL, acquired: false }],
          });

          // when
          const result = complementaryCertificationCourseWithResults.isAcquiredExpectedLevelByPixSource();

          // then
          expect(result).to.be.false;
        });
      });
    });
    context(' on different level', function () {
      describe('when the certification is acquired by PIX', function () {
        it('should return false', function () {
          // given
          const complementaryCertificationCourseWithResults = new ComplementaryCertificationCourseWithResults({
            complementaryCertificationBadgeId: 3,
            results: [{ complementaryCertificationBadgeId: 4, source: sources.PIX, acquired: true }],
          });

          // when
          const result = complementaryCertificationCourseWithResults.isAcquiredExpectedLevelByPixSource();

          // then
          expect(result).to.be.false;
        });
      });

      describe('when the certification is not acquired by PIX', function () {
        it('should return false', function () {
          // given
          const complementaryCertificationCourseWithResults = new ComplementaryCertificationCourseWithResults({
            complementaryCertificationBadgeId: 4,
            results: [{ complementaryCertificationBadgeId: 3, source: sources.PIX, acquired: false }],
          });

          // when
          const result = complementaryCertificationCourseWithResults.isAcquiredExpectedLevelByPixSource();

          // then
          expect(result).to.be.false;
        });
      });
    });
  });
});
