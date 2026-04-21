import sinon from 'sinon';

import { getCertificationCenterAccess } from '../../../../../src/identity-access-management/application/api/certification-center-access-api.js';
import { AllowedCertificationCenterAccessDTO } from '../../../../../src/identity-access-management/application/api/models/AllowedCertificationCenterAccessDTO.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Identity Access Management | Application | API | Certification Center Access', function () {
  describe('#getCertificationCenterAccess', function () {
    it('should return certification center access DTO', async function () {
      const certificationPointOfContactRepository = {
        getCertificationCenterAccess: sinon.stub(),
      };
      const certificationCenterId = 123;
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        id: certificationCenterId,
      });

      certificationPointOfContactRepository.getCertificationCenterAccess
        .withArgs({ certificationCenterId })
        .resolves(allowedCertificationCenterAccess);

      const certificationCenterAccess = await getCertificationCenterAccess({
        certificationCenterId,
        dependencies: { certificationPointOfContactRepository },
      });

      const expectedCertificationCenterAccessDTO = new AllowedCertificationCenterAccessDTO({});
      expect(certificationCenterAccess).to.deep.equal(expectedCertificationCenterAccessDTO);
    });
  });
});
