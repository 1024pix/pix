import { ComplementaryCertificationCourseWithResults } from '../../../../lib/domain/models/ComplementaryCertificationCourseWithResults.js';
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
});
