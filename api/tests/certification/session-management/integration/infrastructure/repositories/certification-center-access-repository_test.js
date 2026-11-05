import { expect } from 'chai';

import * as certificationCenterAccessRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/certification-center-access-repository.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Session Management | Integration | Infrastructure | Repository | certification center access', function () {
  describe('#getCertificationCenterAccess', function () {
    it('should return the certification center access information', async function () {
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();

      await databaseBuilder.commit();

      const certificationCenterAccess = await certificationCenterAccessRepository.getCertificationCenterAccess({
        certificationCenterId: certificationCenter.id,
      });

      expect(certificationCenterAccess).to.deep.equal({
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
        pixCertifScoBlockedAccessDateCollege: null,
        pixCertifScoBlockedAccessDateLycee: null,
      });
    });
  });
});
