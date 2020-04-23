const { expect } = require('../../../test-helper');
const CertificationPartnerAcquisition = require('../../../../lib/domain/models/CertificationPartnerAcquisition');

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

      [1, 50, 80, 90, 100].forEach((reproducabilityRate) =>
        it(`for ${reproducabilityRate} reproducability rate, it should not obtain certification`, async () => {
          // when
          const hasAcquiredCertif = certificationPartnerAcquisition.hasAcquiredCertification({ percentageCorrectAnswers: reproducabilityRate, hasAcquiredBadge: false });

          // then
          expect(hasAcquiredCertif).to.be.false;
        })
      );
    });

    context('when user has badge', () => {
      beforeEach(() => {
        certificationPartnerAcquisition = new CertificationPartnerAcquisition({
          certificationCourseId: Symbol('certificationCourseId'),
          partnerKey: Symbol('partnerKey'),
        });
      });

      [80, 90, 100].forEach((reproducabilityRate) =>
        it(`for ${reproducabilityRate} reproducability rate, it should obtain certification`, async () => {
          // when
          const hasAcquiredCertif = certificationPartnerAcquisition.hasAcquiredCertification({ hasAcquiredBadge: true, percentageCorrectAnswers:reproducabilityRate });

          // then
          expect(hasAcquiredCertif).to.be.true;
        })
      );

      [1, 50].forEach((reproducabilityRate) =>
        it(`for ${reproducabilityRate} reproducability rate, it should not obtain certification`, async () => {
          // when
          const hasAcquiredCertif = certificationPartnerAcquisition.hasAcquiredCertification({ hasAcquiredBadge: true, percentageCorrectAnswers:reproducabilityRate });

          // then
          expect(hasAcquiredCertif).to.be.false;

        })
      );
    });

  });
});
