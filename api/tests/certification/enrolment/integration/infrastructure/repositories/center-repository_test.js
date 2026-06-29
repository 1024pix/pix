import * as centerRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/center-repository.js';
import { types } from '../../../../../../src/organizational-entities/domain/models/Organization.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { CertificationCenter } from '../../../../../../src/shared/domain/models/CertificationCenter.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Certification |  Center | Repository | center-repository', function () {
  describe('#getById', function () {
    context('when the certification center could not be found', function () {
      it('should throw a NotFound error', async function () {
        // when
        const unknownCenterId = 1;
        const error = await catchErr(centerRepository.getById)({ id: unknownCenterId });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Center not found');
      });
    });

    context('when the certification center has no habilitations', function () {
      it('should return the certification center without habilitations', async function () {
        // given
        const centerId = 1;
        databaseBuilder.factory.buildCertificationCenter({
          id: centerId,
          type: CertificationCenter.types.PRO,
        });
        await databaseBuilder.commit();

        // when
        const result = await centerRepository.getById({
          id: centerId,
        });

        // then
        const expectedCenter = domainBuilder.certification.enrolment.buildCenter({
          id: centerId,
          name: 'some name',
          type: 'PRO',
          externalId: 'EX123',
          habilitations: [],
        });
        expect(result).to.deepEqualInstance(expectedCenter);
      });
    });

    context('when the certification center has a matching organization (SCO)', function () {
      it('should return the certification center with matching organization', async function () {
        // given
        const centerId = 1;
        const matchingOrganizationId = 2;
        databaseBuilder.factory.buildCertificationCenter({
          id: centerId,
          name: 'centerName',
          type: CertificationCenter.types.SCO,
          externalId: 'EXTERNALABC',
        });
        databaseBuilder.factory.buildOrganization({
          id: matchingOrganizationId,
          type: types.SCO,
          externalId: 'EXTERNALABC',
          isManagingStudents: true,
        });
        databaseBuilder.factory.buildOrganization({
          type: types.SCO,
          externalId: 'EXTERNALDEF',
          isManagingStudents: true,
        });
        databaseBuilder.factory.buildOrganization({
          type: types.PRO,
          externalId: 'EXTERNALABC',
          isManagingStudents: true,
        });
        await databaseBuilder.commit();

        // when
        const center = await centerRepository.getById({
          id: centerId,
        });

        // then
        const expectedCenter = domainBuilder.certification.enrolment.buildCenter({
          id: centerId,
          name: 'centerName',
          externalId: 'EXTERNALABC',
          type: CertificationCenter.types.SCO,
          habilitations: [],
          matchingOrganization: domainBuilder.certification.enrolment.buildMatchingOrganization({
            id: matchingOrganizationId,
            externalId: 'EXTERNALABC',
            type: types.SCO,
            isManagingStudents: true,
          }),
        });
        expect(center).to.deepEqualInstance(expectedCenter);
      });
    });

    it('should return the certification center by its id', async function () {
      // given
      const centerId = 1;
      databaseBuilder.factory.buildCertificationCenter({
        id: centerId,
        type: CertificationCenter.types.SCO,
      });
      const clea = databaseBuilder.factory.buildComplementaryCertification.clea({});
      const droit = databaseBuilder.factory.buildComplementaryCertification.droit({});
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: centerId,
        complementaryCertificationId: clea.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: centerId,
        complementaryCertificationId: droit.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await centerRepository.getById({
        id: centerId,
      });

      // then
      const expectedCenter = domainBuilder.certification.enrolment.buildCenter({
        id: centerId,
        name: 'some name',
        type: 'SCO',
        externalId: 'EX123',
        habilitations: [
          domainBuilder.certification.enrolment.buildHabilitation({
            complementaryCertificationId: clea.id,
            key: clea.key,
            label: clea.label,
          }),
          domainBuilder.certification.enrolment.buildHabilitation({
            complementaryCertificationId: droit.id,
            key: droit.key,
            label: droit.label,
          }),
        ],
      });
      expect(result).to.deepEqualInstance(expectedCenter);
    });
  });

  describe('#findActiveScoOrganizationId', function () {
    context('when the certification center has an active linked organization', function () {
      it('should return the linked organization id (case insensitive', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
          type: CertificationCenter.types.SCO,
          externalId: 'exTernAlAbC',
        });

        databaseBuilder.factory.buildOrganization({
          type: CertificationCenter.types.SCO,
          externalId: 'EXTErnalABc',
          archivedAt: new Date(),
          archivedBy: databaseBuilder.factory.buildUser().id,
        });

        const activeOrganization = databaseBuilder.factory.buildOrganization({
          type: CertificationCenter.types.SCO,
          externalId: 'EXTErnalABc',
          archivedAt: null,
          archivedBy: null,
        });

        await databaseBuilder.commit();

        // when
        const result = await centerRepository.findActiveScoOrganizationId({
          certificationCenterId: certificationCenter.id,
        });

        // then
        expect(result).to.equal(activeOrganization.id);
      });
    });

    context('when the certification center has no active linked organization', function () {
      it('should return null', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
          type: CertificationCenter.types.SCO,
          externalId: 'EXTERNALABC',
        });

        databaseBuilder.factory.buildOrganization({
          type: CertificationCenter.types.SCO,
          externalId: certificationCenter.externalId,
          archivedAt: new Date(),
          archivedBy: databaseBuilder.factory.buildUser().id,
        });

        await databaseBuilder.commit();

        // when
        const result = await centerRepository.findActiveScoOrganizationId({
          certificationCenterId: certificationCenter.id,
        });

        // then
        expect(result).to.be.null;
      });
    });

    context('when the certification center does not exist', function () {
      it('should return null', async function () {
        // when
        const result = await centerRepository.findActiveScoOrganizationId({
          certificationCenterId: 9999,
        });

        // then
        expect(result).to.be.null;
      });
    });

    context('when only a non-SCO organization shares the certification center externalId', function () {
      it('should return null', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
          type: CertificationCenter.types.SCO,
          externalId: 'EXTERNALABC',
        });

        databaseBuilder.factory.buildOrganization({
          type: types.SUP,
          externalId: certificationCenter.externalId,
          archivedAt: null,
          archivedBy: null,
        });

        await databaseBuilder.commit();

        // when
        const result = await centerRepository.findActiveScoOrganizationId({
          certificationCenterId: certificationCenter.id,
        });

        // then
        expect(result).to.be.null;
      });
    });
  });
});
