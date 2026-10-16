import { expect } from 'chai';

import {
  DoubleCertificationEligibility,
  UserCertificationEligibility,
} from '../../../../../../src/certification/enrolment/domain/read-models/UserCertificationEligibility.js';

describe('Certification | Enrolment | Unit | Domain | ReadModels | UserCertificationEligibility', function () {
  describe('isEligibleForDoubleCertification', function () {
    it('returns true when candidate is eligible to double certification', function () {
      const userCertificationEligibility = new UserCertificationEligibility({
        id: 12,
        isCertifiable: false,
        doubleCertificationEligibility: new DoubleCertificationEligibility({
          certificationAlreadySucceeded: false,
          isEligible: true,
        }),
      });
      expect(userCertificationEligibility.isEligibleForDoubleCertification()).to.be.true;
    });

    it('returns false when candidate has no doubleCertificationEligibility', function () {
      const userCertificationEligibility = new UserCertificationEligibility({
        id: 12,
        isCertifiable: false,
        doubleCertificationEligibility: null,
      });
      expect(userCertificationEligibility.isEligibleForDoubleCertification()).to.be.false;
    });

    it('returns false when candidates has doubleCertificationEligibility with an invalid badge', function () {
      const userCertificationEligibility = new UserCertificationEligibility({
        id: 12,
        isCertifiable: false,
        doubleCertificationEligibility: new DoubleCertificationEligibility({
          certificationAlreadySucceeded: true,
          isEligible: false,
        }),
      });
      expect(userCertificationEligibility.isEligibleForDoubleCertification()).to.be.false;
    });
  });
});
