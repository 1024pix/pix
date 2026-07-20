import { expect } from 'chai';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration Unit | Domain | ReadModels | CertificationInfo', function () {
  describe('#get isActive', function () {
    it('returns true only when certification info relates to an active version', function () {
      const draftCertificationInfo = domainBuilder.certification.configuration
        .certificationInfoBuilder()
        .asDraft()
        .build();
      const activeCertificationInfo = domainBuilder.certification.configuration
        .certificationInfoBuilder()
        .asActive()
        .build();
      const archivedCertificationInfo = domainBuilder.certification.configuration
        .certificationInfoBuilder()
        .asArchived()
        .build();

      expect(draftCertificationInfo.isActive).to.be.false;
      expect(activeCertificationInfo.isActive).to.be.true;
      expect(archivedCertificationInfo.isActive).to.be.false;
    });
  });
});
