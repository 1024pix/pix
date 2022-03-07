const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | PixPlusEduCertificationScoring', function () {
  context('#isAcquired', function () {
    it('returns true when Pix+ Edu certification is acquired and reproducibility rate is over 70', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 71 });
      const pixPlusEduCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
        hasAcquiredPixCertification: true,
        reproducibilityRate,
      });

      // when
      const isAcquired = pixPlusEduCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.true;
    });

    it('returns true when Pix+ Edu certification is acquired and reproducibility rate is equal 70', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 70 });
      const pixPlusEduCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
        hasAcquiredPixCertification: true,
        reproducibilityRate,
      });

      // when
      const isAcquired = pixPlusEduCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.true;
    });

    it('returns false when Pix+ Edu certification is not acquired even if reproducibility rate is over 70', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 70 });
      const pixPlusEduCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
        hasAcquiredPixCertification: false,
        reproducibilityRate,
      });

      // when
      const isAcquired = pixPlusEduCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });

    it('returns false when reproducibility rate is under 70 even if Pix+ Edu certification is acquired', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 69 });
      const pixPlusEduCertificationScoring = domainBuilder.buildPixPlusEduCertificationScoring({
        hasAcquiredPixCertification: true,
        reproducibilityRate,
      });

      // when
      const isAcquired = pixPlusEduCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });
  });
});
