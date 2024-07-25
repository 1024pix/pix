import { ComplementaryCertificationScoringWithComplementaryReferential } from '../../../../src/shared/domain/models/ComplementaryCertificationScoringWithComplementaryReferential.js';
import { domainBuilder, expect } from '../../../test-helper.js';

describe('Unit | Domain | Models | ComplementaryCertificationScoringWithComplementaryReferential', function () {
  context('#constructor', function () {
    it('set badge key and source', function () {
      // given / when
      const complementaryCertificationScoringWithComplementaryReferential =
        new ComplementaryCertificationScoringWithComplementaryReferential({
          complementaryCertificationCourseId: 99,
          complementaryCertificationBadgeId: 89,
          reproducibilityRate: 71,
          hasAcquiredPixCertification: false,
          pixScore: 80,
          minimumEarnedPix: 60,
        });

      // then
      expect(complementaryCertificationScoringWithComplementaryReferential).to.deepEqualInstance(
        new ComplementaryCertificationScoringWithComplementaryReferential({
          complementaryCertificationCourseId: 99,
          complementaryCertificationBadgeId: 89,
          reproducibilityRate: 71,
          hasAcquiredPixCertification: false,
          minimumReproducibilityRate: undefined,
          source: 'PIX',
          pixScore: 80,
          minimumEarnedPix: 60,
        }),
      );
    });
  });

  context('#isAcquired', function () {
    it('returns true when Pix+ certification is acquired and reproducibility rate is over minimum reproducibility rate', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 71 });
      const complementaryCertificationScoringWithComplementaryReferential =
        domainBuilder.buildComplementaryCertificationScoringWithComplementaryReferential({
          hasAcquiredPixCertification: true,
          reproducibilityRate,
          minimumReproducibilityRate: 70,
          pixScore: 80,
          minimumEarnedPix: 60,
        });

      // when
      const isAcquired = complementaryCertificationScoringWithComplementaryReferential.isAcquired();

      // then
      expect(isAcquired).to.be.true;
    });

    it('returns true when Pix+ certification is acquired and reproducibility rate is equal minimum reproducibility rate', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 70 });
      const complementaryCertificationScoringWithComplementaryReferential =
        domainBuilder.buildComplementaryCertificationScoringWithComplementaryReferential({
          hasAcquiredPixCertification: true,
          reproducibilityRate,
          minimumReproducibilityRate: 70,
          pixScore: 80,
          minimumEarnedPix: 60,
        });

      // when
      const isAcquired = complementaryCertificationScoringWithComplementaryReferential.isAcquired();

      // then
      expect(isAcquired).to.be.true;
    });

    it('returns false when Pix+ certification is not acquired even if reproducibility rate is over minimum reproducibility rate', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 71 });
      const complementaryCertificationScoringWithComplementaryReferential =
        domainBuilder.buildComplementaryCertificationScoringWithComplementaryReferential({
          hasAcquiredPixCertification: false,
          reproducibilityRate,
          minimumReproducibilityRate: 70,
          pixScore: 80,
          minimumEarnedPix: 60,
        });

      // when
      const isAcquired = complementaryCertificationScoringWithComplementaryReferential.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });

    it('returns false when reproducibility rate is under minimum reproducibility rate even if Pix+ certification is acquired', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 69 });
      const complementaryCertificationScoringWithComplementaryReferential =
        domainBuilder.buildComplementaryCertificationScoringWithComplementaryReferential({
          hasAcquiredPixCertification: true,
          reproducibilityRate,
          minimumReproducibilityRate: 70,
          pixScore: 80,
          minimumEarnedPix: 60,
        });

      // when
      const isAcquired = complementaryCertificationScoringWithComplementaryReferential.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });

    context('when pixScore is under minimumEarnedPix rate even if Pix+ certification is acquired', function () {
      it('returns false', function () {
        // given
        const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 69 });
        const complementaryCertificationScoringWithComplementaryReferential =
          domainBuilder.buildComplementaryCertificationScoringWithComplementaryReferential({
            hasAcquiredPixCertification: true,
            reproducibilityRate,
            minimumReproducibilityRate: 70,
            pixScore: 60,
            minimumEarnedPix: 80,
          });

        // when
        const isAcquired = complementaryCertificationScoringWithComplementaryReferential.isAcquired();

        // then
        expect(isAcquired).to.be.false;
      });
    });
  });
});
