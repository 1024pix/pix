const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | PixPlusDroitCertificationScoring', function () {
  context('#isAcquired', function () {
    it('returns true when Pix+ Droit certification is acquired and reproducibility rate is over 75', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 76 });
      const pixPlusDroitCertificationScoring = domainBuilder.buildPixPlusDroitCertificationScoring({
        hasAcquiredPixCertification: true,
        reproducibilityRate,
      });

      // when
      const isAcquired = pixPlusDroitCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.true;
    });

    it('returns true when Pix+ Droit certification is acquired and reproducibility rate is equal 75', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 75 });
      const pixPlusDroitCertificationScoring = domainBuilder.buildPixPlusDroitCertificationScoring({
        hasAcquiredPixCertification: true,
        reproducibilityRate,
      });

      // when
      const isAcquired = pixPlusDroitCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.true;
    });

    it('returns false when Pix+ Droit certification is not acquired even if reproducibility rate is over 75', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 75 });
      const pixPlusDroitCertificationScoring = domainBuilder.buildPixPlusDroitCertificationScoring({
        hasAcquiredPixCertification: false,
        reproducibilityRate,
      });

      // when
      const isAcquired = pixPlusDroitCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });

    it('returns false when reproducibility rate is under 75 even if Pix+ Droit certification is acquired', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({ value: 74 });
      const pixPlusDroitCertificationScoring = domainBuilder.buildPixPlusDroitCertificationScoring({
        hasAcquiredPixCertification: true,
        reproducibilityRate,
      });

      // when
      const isAcquired = pixPlusDroitCertificationScoring.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });
  });
});
