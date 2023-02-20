import { expect, domainBuilder } from '../../../test-helper';
import CertificationEligibility from '../../../../lib/domain/read-models/CertificationEligibility';

describe('Unit | Domain | Read-models | CertificationEligibility', function () {
  describe('static #notCertifiable', function () {
    it('should return a not certifiable CertificationEligibility', function () {
      // given
      const userId = 1234;

      // when
      const notCertifiableCertificationEligibility = CertificationEligibility.notCertifiable({ userId });

      // then
      expect(notCertifiableCertificationEligibility).to.deep.equal(
        domainBuilder.buildCertificationEligibility({ id: userId, pixCertificationEligible: false })
      );
    });
  });
});
