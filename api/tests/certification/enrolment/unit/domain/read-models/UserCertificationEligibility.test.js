import {
  CertificationEligibility,
  UserCertificationEligibility,
} from '../../../../../../src/certification/enrolment/domain/read-models/UserCertificationEligibility.js';

describe('Certification | Enrolment | Unit | Domain | ReadModels | UserCertificationEligibility', function () {
  describe('#isEligibleToDoubleCertification', function () {
    it('returns true when candidate is eligible to double certification', function () {
      const userCertificationEligibility = new UserCertificationEligibility({
        id: 12,
        isCertifiable: false,
        doubleCertificationEligibility: new CertificationEligibility({
          validateDoubleCertificaiton: true,
          isBadgeValid: true,
        }),
      });
      expect(userCertificationEligibility.isDoubleCertificationOk()).to.be.true;
    });

    it('returns false when candidate has no doubleCertificationEligibility', function () {
      const userCertificationEligibility = new UserCertificationEligibility({
        id: 12,
        isCertifiable: false,
        doubleCertificationEligibility: null,
      });
      expect(userCertificationEligibility.isDoubleCertificationOk()).to.be.false;
    });

    it('returns false when candidates has doubleCertificationEligibility with an invalid badge', function () {
      const userCertificationEligibility = new UserCertificationEligibility({
        id: 12,
        isCertifiable: false,
        doubleCertificationEligibility: new CertificationEligibility({
          validateDoubleCertificaiton: true,
          isBadgeValid: false,
        }),
      });
      expect(userCertificationEligibility.isDoubleCertificationOk()).to.be.false;
    });
  });
});
