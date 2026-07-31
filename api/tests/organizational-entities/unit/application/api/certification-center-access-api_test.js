import sinon from 'sinon';

import { getCertificationCenterAccess } from '../../../../../src/organizational-entities/application/api/certification-center-access-api.js';
import { AllowedCertificationCenterAccessDTO } from '../../../../../src/organizational-entities/application/api/models/AllowedCertificationCenterAccessDTO.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Organizational Entities | Application | API | Certification Center Access', function () {
  describe('#getCertificationCenterAccess', function () {
    it('should return certification center access DTO', async function () {
      const certificationCenterAccessRepository = {
        getCertificationCenterAccess: sinon.stub(),
      };
      const certificationCenterId = 123;
      const allowedCertificationCenterAccess = domainBuilder.buildAllowedCertificationCenterAccess({
        id: certificationCenterId,
      });

      certificationCenterAccessRepository.getCertificationCenterAccess
        .withArgs({ certificationCenterId })
        .resolves(allowedCertificationCenterAccess);

      const certificationCenterAccess = await getCertificationCenterAccess({
        certificationCenterId,
        dependencies: { certificationCenterAccessRepository },
      });

      const expectedCertificationCenterAccessDTO = new AllowedCertificationCenterAccessDTO({});
      expect(certificationCenterAccess).to.deep.equal(expectedCertificationCenterAccessDTO);
    });
  });
});
