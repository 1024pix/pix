import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Evaluation | Domain | Models | DoubleCertificationScoring', function () {
  context('#isAcquired', function () {
    context('pix score is equal or greater than minimum earned pix', function () {
      it('should return true', async function () {
        // given
        const cleaCertificationScoring = await _buildDoubleCertificationScoring({
          pixScore: 120,
          minimumEarnedPix: 120,
          hasAcquiredPixCertification: true,
          isRejectedForFraud: false,
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
        const cleaCertificationScoring = await _buildDoubleCertificationScoring({
          pixScore: 119,
          minimumEarnedPix: 120,
          hasAcquiredPixCertification: true,
          isRejectedForFraud: false,
        });

        // when
        const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

        // then
        expect(hasAcquiredCertif).to.be.false;
      });
    });

    context('certification is rejected for fraud', function () {
      it('should return false', async function () {
        // given
        const cleaCertificationScoring = await _buildDoubleCertificationScoring({
          pixScore: 121,
          minimumEarnedPix: 120,
          hasAcquiredPixCertification: true,
          isRejectedForFraud: true,
        });

        // when
        const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

        // then
        expect(hasAcquiredCertif).to.be.false;
      });
    });

    context('certification has not acquired pix certification', function () {
      it('should return false', async function () {
        // given
        const cleaCertificationScoring = await _buildDoubleCertificationScoring({
          pixScore: 121,
          minimumEarnedPix: 120,
          hasAcquiredPixCertification: false,
          isRejectedForFraud: false,
        });

        // when
        const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

        // then
        expect(hasAcquiredCertif).to.be.false;
      });
    });
  });
});

function _buildDoubleCertificationScoring({
  pixScore = 0,
  minimumEarnedPix,
  hasAcquiredPixCertification,
  isRejectedForFraud,
}) {
  const certificationCourseId = 42;
  const complementaryCertificationCourseId = 999;
  const complementaryCertificationBadgeId = 99;

  return domainBuilder.certification.evaluation.buildDoubleCertificationScoring({
    complementaryCertificationCourseId,
    certificationCourseId,
    complementaryCertificationBadgeId,
    pixScore,
    minimumEarnedPix,
    hasAcquiredPixCertification,
    isRejectedForFraud,
  });
}
