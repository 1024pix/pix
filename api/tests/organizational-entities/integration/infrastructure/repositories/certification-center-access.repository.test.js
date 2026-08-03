import { CertificationCenter } from '../../../../../src/organizational-entities/domain/models/CertificationCenter.js';
import { Organization } from '../../../../../src/organizational-entities/domain/models/Organization.js';
import { AllowedCertificationCenterAccess } from '../../../../../src/organizational-entities/domain/read-models/AllowedCertificationCenterAccess.js';
import * as certificationCenterAccessRepository from '../../../../../src/organizational-entities/infrastructure/repositories/certification-center-access.repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Organizational Entities | Infrastructure | Repository | Certification Center Access', function () {
  describe('#getCertificationCenterAccess', function () {
    it('returns a certification center access for the given ID (case insensitive)', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
        type: CertificationCenter.types.PRO,
        externalId: 'ONEtwoTHREE',
      });
      databaseBuilder.factory.buildOrganization({
        externalId: 'ONETWOthree',
        isManagingStudents: false,
        type: Organization.types.PRO,
      });
      await databaseBuilder.commit();

      // when
      const allowedCertificationCenterAccess = await certificationCenterAccessRepository.getCertificationCenterAccess({
        certificationCenterId: certificationCenter.id,
      });

      // then
      const expectedAllowedCertificationCenterAccess = {
        id: certificationCenter.id,
        name: certificationCenter.name,
        externalId: certificationCenter.externalId,
        type: certificationCenter.type,
        habilitations: [],
        isRelatedToManagingStudentsOrganization: false,
        relatedOrganizationTags: [],
        pixCertifScoBlockedAccessDateCollege: undefined,
        pixCertifScoBlockedAccessDateLycee: undefined,
      };

      expect(allowedCertificationCenterAccess).to.deep.equal(expectedAllowedCertificationCenterAccess);
      expect(allowedCertificationCenterAccess).to.be.instanceOf(AllowedCertificationCenterAccess);
    });

    it('returns the whitelist status of a center', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
        id: 123,
        name: 'Centre Pro',
        type: CertificationCenter.types.PRO,
        externalId: 'AbC123',
      });
      const certificationCenterScoWhitelisted = databaseBuilder.factory.buildCertificationCenter({
        name: 'Centre SCO',
        type: CertificationCenter.types.SCO,
        isScoBlockedAccessWhitelist: true,
      });
      await databaseBuilder.commit();

      // when
      const whitelistedCenterAccess = await certificationCenterAccessRepository.getCertificationCenterAccess({
        certificationCenterId: certificationCenterScoWhitelisted.id,
      });
      const nonWhitelistedCenterAccess = await certificationCenterAccessRepository.getCertificationCenterAccess({
        certificationCenterId: certificationCenter.id,
      });

      // then
      expect(whitelistedCenterAccess.isInWhitelist()).to.be.true;
      expect(nonWhitelistedCenterAccess.isInWhitelist()).to.be.false;
    });

    it('returns the center habilitations', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
        type: CertificationCenter.types.PRO,
        externalId: 'ONETWOTHREE',
      });
      const complementaryCertificationInformation = {
        id: 980,
        key: 'CLEA',
        label: 'CléA Numérique',
      };
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification(
        complementaryCertificationInformation,
      );
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: certificationCenter.id,
        complementaryCertificationId: complementaryCertification.id,
      });
      await databaseBuilder.commit();

      // when
      const certificationCenterAccess = await certificationCenterAccessRepository.getCertificationCenterAccess({
        certificationCenterId: certificationCenter.id,
      });

      // then
      const expectedCertificationCenterAccess = {
        habilitations: [complementaryCertificationInformation],
      };

      expect(certificationCenterAccess.habilitations).to.deep.equal(expectedCertificationCenterAccess.habilitations);
    });
  });
});
