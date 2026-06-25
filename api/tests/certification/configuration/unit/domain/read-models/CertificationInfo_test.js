import { expect } from 'chai';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration Unit | Domain | ReadModels | CertificationInfo', function () {
  describe('#get isCertificationActive', function () {
    it('returns true when has a startDate but no expirationDate', function () {
      const certificationInfo = domainBuilder.certification.configuration.buildCertificationInfo({
        startDate: new Date(),
        expirationDate: null,
      });

      expect(certificationInfo.isCertificationActive).to.be.true;
    });

    it('returns false when has no startDate nor expirationDate', function () {
      const certificationInfo = domainBuilder.certification.configuration.buildCertificationInfo({
        startDate: null,
        expirationDate: null,
      });

      expect(certificationInfo.isCertificationActive).to.be.false;
    });

    it('returns false when has both startDate and expirationDate', function () {
      const certificationInfo = domainBuilder.certification.configuration.buildCertificationInfo({
        startDate: new Date(),
        expirationDate: new Date(),
      });

      expect(certificationInfo.isCertificationActive).to.be.false;
    });
  });
});
