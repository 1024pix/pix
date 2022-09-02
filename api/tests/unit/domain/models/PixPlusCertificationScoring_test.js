const { expect, domainBuilder } = require('../../../test-helper');
const PixPlusCertificationScoring = require('../../../../lib/domain/models/PixPlusCertificationScoring');

describe('Unit | Domain | Models | PixPlusCertificationScoring', function () {
  context('#constructor', function () {
    it('set partnerKey and source', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 71 });

      // when
      const pixPlusCertificationScoring = new PixPlusCertificationScoring({
        complementaryCertificationCourseId: 99,
        complementaryCertificationBadgeKey: 'BADGE',
        reproducibilityRate,
        hasAcquiredPixCertification: false,
      });

      // then
      expect(pixPlusCertificationScoring.source).to.equal('PIX');
      expect(pixPlusCertificationScoring.partnerKey).to.equal('BADGE');
    });
  });
  context('#isAcquired', function () {
    it('returns true when Pix+ certification is acquired and reproducibility rate is over minimum reproducibility rate', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 71 });
      const pixPlusCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({
        hasAcquiredPixCertification: true,
        reproducibilityRate,
        minimumReproducibilityRate: 70,
      });

      // when
      const isAcquired = pixPlusCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.true;
    });

    it('returns true when Pix+ certification is acquired and reproducibility rate is equal minimum reproducibility rate', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 70 });
      const pixPlusCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({
        hasAcquiredPixCertification: true,
        reproducibilityRate,
        minimumReproducibilityRate: 70,
      });

      // when
      const isAcquired = pixPlusCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.true;
    });

    it('returns false when Pix+ certification is not acquired even if reproducibility rate is over minimum reproducibility rate', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 71 });
      const pixPlusCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({
        hasAcquiredPixCertification: false,
        reproducibilityRate,
        minimumReproducibilityRate: 70,
      });

      // when
      const isAcquired = pixPlusCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });

    it('returns false when reproducibility rate is under minimum reproducibility rat even if Pix+ certification is acquired', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 69 });
      const pixPlusCertificationScoring = domainBuilder.buildPixPlusCertificationScoring({
        hasAcquiredPixCertification: true,
        reproducibilityRate,
        minimumReproducibilityRate: 70,
      });

      // when
      const isAcquired = pixPlusCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });
  });
});
