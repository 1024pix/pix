import { ComplementaryCertificationCourseResult } from '../../../../lib/domain/models/ComplementaryCertificationCourseResult.js';
import { expect, domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Models | ComplementaryCertificationCourseResult', function () {
  describe('#isAcquired', function () {
    it('should return true if acquired is true', function () {
      // given
      const complementaryCertificationCourseResult = new ComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 'complementaryCertificationCourseId',
        acquired: true,
        source: 'source',
      });

      // when
      const result = complementaryCertificationCourseResult.isAcquired();

      // then
      expect(result).to.be.true;
    });

    it('should return false if acquired is false', function () {
      // given
      const complementaryCertificationCourseResult = new ComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 'complementaryCertificationCourseId',
        acquired: false,
        source: 'source',
      });

      // when
      const result = complementaryCertificationCourseResult.isAcquired();

      // then
      expect(result).to.be.false;
    });
  });

  describe('#buildFromJuryLevel', function () {
    describe('when the jury level is not "REJECTED"', function () {
      it('should return an acquired ComplementaryCertificationCourseResult with an external source', function () {
        // given
        // when
        const result = ComplementaryCertificationCourseResult.buildFromJuryLevel({
          juryLevel: 25,
          complementaryCertificationCourseId: 12,
          complementaryCertificationBadgeId: 25,
        });

        // then
        expect(result).to.deepEqualInstance(
          new ComplementaryCertificationCourseResult({
            acquired: true,
            source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
            complementaryCertificationBadgeId: 25,
            complementaryCertificationCourseId: 12,
          }),
        );
      });
    });

    describe('when the jury level is "REJECTED"', function () {
      it('should return an acquired ComplementaryCertificationCourseResult with an external source', function () {
        // given
        // when
        const result = ComplementaryCertificationCourseResult.buildFromJuryLevel({
          juryLevel: 'REJECTED',
          complementaryCertificationCourseId: 12,
        });

        // then
        expect(result).to.deepEqualInstance(
          new ComplementaryCertificationCourseResult({
            acquired: false,
            source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
            complementaryCertificationCourseId: 12,
          }),
        );
      });
    });
  });

  describe('#isFromPixSource', function () {
    describe('when source is PIX', function () {
      it('should return true', function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          source: ComplementaryCertificationCourseResult.sources.PIX,
          acquired: true,
          complementaryCertificationCourseId: 12,
        });

        // when then
        expect(complementaryCertificationCourseResult.isFromPixSource()).to.be.true;
      });
    });

    describe('when source is not PIX', function () {
      it('should return false', function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
          acquired: true,
          complementaryCertificationCourseId: 12,
        });

        // when then
        expect(complementaryCertificationCourseResult.isFromPixSource()).to.be.false;
      });
    });
  });

  describe('#isFromExternalSource', function () {
    describe('when source is EXTERNAL', function () {
      it('should return true', function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
          acquired: true,
          complementaryCertificationCourseId: 12,
        });

        // when then
        expect(complementaryCertificationCourseResult.isFromExternalSource()).to.be.true;
      });
    });

    describe('when source is not EXTERNAL', function () {
      it('should return false', function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          source: ComplementaryCertificationCourseResult.sources.PIX,
          acquired: true,
          complementaryCertificationCourseId: 12,
        });

        // when then
        expect(complementaryCertificationCourseResult.isFromExternalSource()).to.be.false;
      });
    });
  });
});
