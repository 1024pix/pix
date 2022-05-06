const CleaCertificationScoring = require('../../../../lib/domain/models/CleaCertificationScoring');
const { expect, catchErr, domainBuilder } = require('../../../test-helper');
const { ObjectValidationError, NotEligibleCandidateError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | CleaCertificationScoring', function () {
  describe('constructor', function () {
    let validArguments;
    beforeEach(function () {
      validArguments = {
        complementaryCertificationCourseId: 999,
        certificationCourseId: 123,
        cleaBadgeKey: 'partnerKey',
        hasAcquiredBadge: true,
        reproducibilityRate: 80,
      };
    });

    it('should successfully instantiate object when passing all valid arguments', function () {
      // when
      expect(() => new CleaCertificationScoring(validArguments)).not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when hasAcquiredBadge is not valid', function () {
      // when
      expect(
        () =>
          new CleaCertificationScoring({
            ...validArguments,
            hasAcquiredBadge: 'coucou',
          })
      ).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when reproducibilityRate is not valid', function () {
      // when
      expect(
        () =>
          new CleaCertificationScoring({
            ...validArguments,
            reproducibilityRate: 'coucou',
          })
      ).to.throw(ObjectValidationError);
    });
  });

  context('#static buildNotEligible', function () {
    it('should build a not eligible CleaCertificationScoring', async function () {
      // when
      const notEligibleCleaCertificationScoring = CleaCertificationScoring.buildNotEligible({
        complementaryCertificationCourseId: 999,
      });

      // then
      expect(notEligibleCleaCertificationScoring.isEligible()).to.be.false;
    });
  });

  context('#isEligible', function () {
    it('when user has badge it is eligible', async function () {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithBadge();

      // when
      const hasAcquiredCertif = cleaCertificationScoring.isEligible();

      // then
      expect(hasAcquiredCertif).to.be.true;
    });

    it('when user does not have badge it is not eligible', async function () {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithoutBadge();

      // when
      const hasAcquiredCertif = cleaCertificationScoring.isEligible();

      // then
      expect(hasAcquiredCertif).to.be.false;
    });
  });

  context('#setBadgeAcquisitionStillValid', function () {
    it('when user has badge and set stillAcquired at true, should be eligible', async function () {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithBadge();

      // when
      cleaCertificationScoring.setBadgeAcquisitionStillValid(true);

      // then
      expect(cleaCertificationScoring.isBadgeAcquisitionStillValid).to.be.true;
      expect(cleaCertificationScoring.isEligible()).to.be.true;
    });

    it('when user has badge and set stillAcquired at false, should not be eligible', async function () {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithBadge();

      // when
      cleaCertificationScoring.setBadgeAcquisitionStillValid(false);

      // then
      expect(cleaCertificationScoring.isBadgeAcquisitionStillValid).to.be.false;
      expect(cleaCertificationScoring.hasAcquiredBadge).to.be.true;
      expect(cleaCertificationScoring.isEligible()).to.be.false;
    });
  });

  context('#isAcquired', function () {
    it('throws when not eligible', async function () {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithoutBadge();

      // when
      const error = await catchErr(cleaCertificationScoring.isAcquired, cleaCertificationScoring)();

      // then
      expect(error).to.be.instanceOf(NotEligibleCandidateError);
    });

    context('reproducibility rate is equal or greater than minimum reproducibility rate', function () {
      const minimumReproducibilityRate = 70;

      // eslint-disable-next-line mocha/no-setup-in-describe
      [70, 80, 90].forEach((reproducibilityRate) => {
        context('pix score is equal or greater than minimum earned pix', function () {
          it('should return true', async function () {
            // given
            const cleaCertificationScoring = await _buildCleaCertificationScoringWithBadge({
              reproducibilityRate,
              minimumReproducibilityRate,
              pixScore: 120,
              minimumEarnedPix: 120,
            });

            // when
            const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

            // then
            expect(hasAcquiredCertif).to.be.true;
          });
        });

        context('pix score is lower than minimum earned pix', function () {
          it('should return false', async function () {
            // given
            const cleaCertificationScoring = await _buildCleaCertificationScoringWithBadge({
              reproducibilityRate,
              minimumReproducibilityRate,
              pixScore: 119,
              minimumEarnedPix: 120,
            });

            // when
            const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

            // then
            expect(hasAcquiredCertif).to.be.false;
          });
        });
      });
    });

    context('reproducibility rate is lower than minimum reproducibility rate', function () {
      const minimumReproducibilityRate = 70;

      // eslint-disable-next-line mocha/no-setup-in-describe
      [1, 50, 69].forEach((reproducibilityRate) => {
        context('pix score is equal or greater than minimum earned pix', function () {
          it('should return false', async function () {
            // given
            const cleaCertificationScoring = await _buildCleaCertificationScoringWithBadge({
              reproducibilityRate,
              minimumReproducibilityRate,
              pixScore: 120,
              minimumEarnedPix: 120,
            });

            // when
            const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

            // then
            expect(hasAcquiredCertif).to.be.false;
          });
        });

        context('pix score is lower than minimum earned pix', function () {
          it('should return false', async function () {
            // given
            const cleaCertificationScoring = await _buildCleaCertificationScoringWithBadge({
              reproducibilityRate,
              minimumReproducibilityRate,
              pixScore: 119,
              minimumEarnedPix: 120,
            });

            // when
            const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

            // then
            expect(hasAcquiredCertif).to.be.false;
          });
        });
      });
    });
  });
});

function _buildCleaCertificationScoringWithBadge({
  reproducibilityRate,
  pixScore,
  minimumEarnedPix,
  minimumReproducibilityRate,
} = {}) {
  return _buildCleaCertificationScoring({
    withBadge: true,
    reproducibilityRate,
    pixScore,
    minimumEarnedPix,
    minimumReproducibilityRate,
  });
}

function _buildCleaCertificationScoringWithoutBadge() {
  return _buildCleaCertificationScoring({ withBadge: false });
}

function _buildCleaCertificationScoring({
  withBadge = false,
  reproducibilityRate = 0,
  pixScore = 0,
  minimumEarnedPix,
  minimumReproducibilityRate,
}) {
  const certificationCourseId = 42;
  const complementaryCertificationCourseId = 999;

  return domainBuilder.buildCleaCertificationScoring({
    complementaryCertificationCourseId,
    certificationCourseId,
    hasAcquiredBadge: withBadge,
    reproducibilityRate,
    cleaBadgeKey: 'pix_clea_badge_key',
    pixScore,
    minimumEarnedPix,
    minimumReproducibilityRate,
  });
}
