import { expect, domainBuilder } from '../../../test-helper';

describe('Unit | Domain | Models | ComplementaryCertificationScoringWithoutComplementaryReferential', function () {
  context('#isAcquired', function () {
    context('reproducibility rate is equal or greater than minimum reproducibility rate', function () {
      const minimumReproducibilityRate = 70;

      // eslint-disable-next-line mocha/no-setup-in-describe
      [70, 80, 90].forEach((reproducibilityRate) => {
        context('pix score is equal or greater than minimum earned pix', function () {
          it('should return true', async function () {
            // given
            const cleaCertificationScoring =
              await _buildComplementaryCertificationScoringWithoutComplementaryReferential({
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
            const cleaCertificationScoring =
              await _buildComplementaryCertificationScoringWithoutComplementaryReferential({
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
            const cleaCertificationScoring =
              await _buildComplementaryCertificationScoringWithoutComplementaryReferential({
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
            const cleaCertificationScoring =
              await _buildComplementaryCertificationScoringWithoutComplementaryReferential({
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

function _buildComplementaryCertificationScoringWithoutComplementaryReferential({
  reproducibilityRate = 0,
  pixScore = 0,
  minimumEarnedPix,
  minimumReproducibilityRate,
}) {
  const certificationCourseId = 42;
  const complementaryCertificationCourseId = 999;

  return domainBuilder.buildComplementaryCertificationScoringWithoutComplementaryReferential({
    complementaryCertificationCourseId,
    certificationCourseId,
    reproducibilityRate,
    complementaryCertificationBadgeKey: 'PIX_TEST',
    pixScore,
    minimumEarnedPix,
    minimumReproducibilityRate,
  });
}
