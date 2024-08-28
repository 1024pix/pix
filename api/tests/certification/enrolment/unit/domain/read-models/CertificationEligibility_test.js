import { CertificationEligibility } from '../../../../../../src/certification/enrolment/domain/read-models/CertificationEligibility.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Domain | Read-models | CertificationEligibility', function () {
  describe('static #notCertifiable', function () {
    it('should return a not certifiable CertificationEligibility', function () {
      // given
      const userId = 1234;

      // when
      const notCertifiableCertificationEligibility = CertificationEligibility.notCertifiable({ userId });

      // then
      expect(notCertifiableCertificationEligibility).to.deep.equal(
        domainBuilder.certification.enrolment.buildCertificationEligibility({
          id: userId,
          pixCertificationEligible: false,
        }),
      );
    });
  });
});
