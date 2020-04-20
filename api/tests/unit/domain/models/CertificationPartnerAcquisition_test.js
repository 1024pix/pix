const { expect } = require('../../../test-helper');
const CertificationPartnerAcquisition = require('../../../../lib/domain/models/CertificationPartnerAcquisition');

const GREEN_ZONE_REPRO = [80, 90, 100];
const RED_ZONE_REPRO = [1, 50];
const GREY_ZONE_REPRO = [75];
describe('Unit | Domain | Models | CertificationPartnerAcquisition', () => {
  let certificationPartnerAcquisition;
  describe('#hasAcquiredCertification', () => {

    context('when user does not have badge', () => {
      beforeEach(() => {
        certificationPartnerAcquisition = new CertificationPartnerAcquisition(
          Symbol('certificationCourseId'),
          Symbol('partnerKey'),
        );
      });

      it('for any reproducibility rate, it should not obtain certification', async () => {
        // when
        const hasAcquiredCertif = certificationPartnerAcquisition.hasAcquiredCertification({ hasAcquiredBadge: false });

        // then
        expect(hasAcquiredCertif).to.be.false;
      });
    });

    context('when user has badge', () => {
      beforeEach(() => {
        certificationPartnerAcquisition = new CertificationPartnerAcquisition({
          certificationCourseId: Symbol('certificationCourseId'),
          partnerKey: Symbol('partnerKey'),
        });
      });

      context('reproducibility rate in green zone', () => {
        GREEN_ZONE_REPRO.forEach((reproducibilityRate) =>
          it(`for ${reproducibilityRate} reproducibility rate, it should obtain certification`, async () => {
            // when
            const hasAcquiredCertif = certificationPartnerAcquisition.hasAcquiredCertification({
              hasAcquiredBadge: true,
              reproducibilityRate
            });

            // then
            expect(hasAcquiredCertif).to.be.true;
          })
        );
      });

      context('reproducibility rate in grey zone', () => {
        const reproducibilityRate = GREY_ZONE_REPRO[0];
        it(`for ${reproducibilityRate} reproducibility rate, it should obtain certification`, async () => {
          // when
          const hasAcquiredCertif = certificationPartnerAcquisition.hasAcquiredCertification({
            hasAcquiredBadge: true,
            reproducibilityRate
          });

          // then
          expect(hasAcquiredCertif).to.be.true;
        });
      });

      context('reproducibility rate in red zone', () => {
        RED_ZONE_REPRO.forEach((reproducibilityRate) =>
          it(`for ${reproducibilityRate} reproducibility rate, it should not obtain certification`, async () => {
            // when
            const hasAcquiredCertif = certificationPartnerAcquisition.hasAcquiredCertification({
              hasAcquiredBadge: true,
              reproducibilityRate
            });

            // then
            expect(hasAcquiredCertif).to.be.false;
          })
        );
      });
    });
  });
});
