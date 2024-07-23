import { ComplementaryCertificationCourseWithResults } from '../../../../lib/domain/models/ComplementaryCertificationCourseWithResults.js';
import { sources } from '../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Domain | Models | ComplementaryCertificationCourseWithResults', function () {
  describe('#isAcquired', function () {
    describe('when no external jury', function () {
      describe('when result is acquired', function () {
        it('should be acquired', function () {
          // given
          const complementaryCertificationCourseWithResults = new ComplementaryCertificationCourseWithResults({
            id: 11,
            hasExternalJury: false,
            results: [
              {
                id: 1,
                acquired: true,
                source: 'source',
              },
            ],
            complementaryCertificationBadgeId: 2,
          });

          // when
          const result = complementaryCertificationCourseWithResults.isAcquired();

          // then
          expect(result).to.be.true;
        });
      });

      describe('when result is not acquired', function () {
        it('should not be acquired', function () {
          // given
          const complementaryCertificationCourseWithResults = new ComplementaryCertificationCourseWithResults({
            id: 11,
            hasExternalJury: false,
            results: [
              {
                id: 1,
                acquired: false,
                source: 'source',
              },
            ],
            complementaryCertificationBadgeId: 2,
          });

          // when
          const result = complementaryCertificationCourseWithResults.isAcquired();

          // then
          expect(result).to.be.false;
        });
      });
    });

    describe('when external jury', function () {
      describe('when external result is not acquired', function () {
        it('should not be acquired', function () {
          // given
          const complementaryCertificationCourseWithResults = new ComplementaryCertificationCourseWithResults({
            id: 11,
            hasExternalJury: true,
            results: [
              {
                id: 1,
                acquired: true,
                source: 'PIX',
              },
              {
                id: 2,
                acquired: false,
                source: 'EXTERNAL',
              },
            ],
            complementaryCertificationBadgeId: 2,
          });

          // when
          const result = complementaryCertificationCourseWithResults.isAcquired();

          // then
          expect(result).to.be.false;
        });
      });

      describe('when external jury result has not yet been registered', function () {
        it('should not be acquired', function () {
          // given
          const complementaryCertificationCourseWithResults = new ComplementaryCertificationCourseWithResults({
            id: 11,
            hasExternalJury: true,
            results: [
              {
                id: 1,
                acquired: true,
                source: 'PIX',
              },
            ],
            complementaryCertificationBadgeId: 2,
          });

          // when
          const result = complementaryCertificationCourseWithResults.isAcquired();

          // then
          expect(result).to.be.false;
        });
      });

      describe('when external jury is acquired and pix certification is not acquired', function () {
        it('should not be acquired', function () {
          // given
          const complementaryCertificationCourseWithResults = new ComplementaryCertificationCourseWithResults({
            id: 11,
            hasExternalJury: true,
            results: [
              {
                id: 1,
                acquired: true,
                source: 'EXTERNAL',
              },
              {
                id: 2,
                acquired: false,
                source: 'PIX',
              },
            ],
            complementaryCertificationBadgeId: 2,
          });

          // when
          const result = complementaryCertificationCourseWithResults.isAcquired();

          // then
          expect(result).to.be.false;
        });
      });
    });
  });

  describe('#isAcquiredByPixSource', function () {
    describe('when the certification is acquired by PIX', function () {
      it('should return true', function () {
        // given
        const complementaryCertificationCourseWithResults = new ComplementaryCertificationCourseWithResults({
          complementaryCertificationBadgeId: 4,
          results: [{ complementaryCertificationBadgeId: 3, source: sources.PIX, acquired: true }],
        });

        // when
        const result = complementaryCertificationCourseWithResults.isAcquiredByPixSource();

        // then
        expect(result).to.be.true;
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
        const result = complementaryCertificationCourseWithResults.isAcquiredByPixSource();

        // then
        expect(result).to.be.false;
      });
    });
  });

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
