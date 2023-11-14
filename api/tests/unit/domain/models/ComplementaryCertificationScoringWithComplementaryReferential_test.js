import { expect, domainBuilder } from '../../../test-helper.js';
import { ComplementaryCertificationScoringWithComplementaryReferential } from '../../../../lib/domain/models/ComplementaryCertificationScoringWithComplementaryReferential.js';

describe('Unit | Domain | Models | ComplementaryCertificationScoringWithComplementaryReferential', function () {
  context('#constructor', function () {
    it('set partnerKey and source', function () {
      // given / when
      const complementaryCertificationScoringWithComplementaryReferential =
        new ComplementaryCertificationScoringWithComplementaryReferential({
          complementaryCertificationCourseId: 99,
          complementaryCertificationBadgeId: 89,
          complementaryCertificationBadgeKey: 'BADGE',
          reproducibilityRate: 71,
          hasAcquiredPixCertification: false,
        });

      // then
      expect(complementaryCertificationScoringWithComplementaryReferential).to.deepEqualInstance(
        new ComplementaryCertificationScoringWithComplementaryReferential({
          complementaryCertificationCourseId: 99,
          complementaryCertificationBadgeId: 89,
          complementaryCertificationBadgeKey: 'BADGE',
          reproducibilityRate: 71,
          hasAcquiredPixCertification: false,
          minimumReproducibilityRate: undefined,
          source: 'PIX',
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
        });

      // when
      const isAcquired = complementaryCertificationScoringWithComplementaryReferential.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });

    it('returns false when reproducibility rate is under minimum reproducibility rat even if Pix+ certification is acquired', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 69 });
      const complementaryCertificationScoringWithComplementaryReferential =
        domainBuilder.buildComplementaryCertificationScoringWithComplementaryReferential({
          hasAcquiredPixCertification: true,
          reproducibilityRate,
          minimumReproducibilityRate: 70,
        });

      // when
      const isAcquired = complementaryCertificationScoringWithComplementaryReferential.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });
  });
});
