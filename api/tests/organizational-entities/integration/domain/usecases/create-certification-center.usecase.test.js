import { knex } from '../../../../../db/knex-database-connection.js';
import { UnableToAttachCertificationCenterToOrganization } from '../../../../../src/organizational-entities/domain/errors.js';
import { CenterForAdmin } from '../../../../../src/organizational-entities/domain/models/CenterForAdmin.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCase | create-certification-center', function () {
  it('saves and returns the certification center', async function () {
    // given
    const superAdminUserId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();

    const certificationCenterDTO = domainBuilder.buildCenterForAdmin({
      center: {
        name: 'Centre de certif SCO',
        type: 'SCO',
        externalId: 'EXT123',
        habilitations: [],
        createdBy: superAdminUserId,
      },
    });

    // when
    const createdCertificationCenter = await usecases.createCertificationCenter({
      certificationCenter: certificationCenterDTO,
      complementaryCertificationIds: [],
      organizationId: undefined,
    });

    // then
    expect(createdCertificationCenter).to.be.instanceOf(CenterForAdmin);
    expect(createdCertificationCenter.name).to.equal('Centre de certif SCO');
    expect(createdCertificationCenter.type).to.equal('SCO');
    expect(createdCertificationCenter.externalId).to.equal('EXT123');
  });

  it('creates and saves data protection officer', async function () {
    // given
    const dataProtectionOfficerInfos = { firstName: 'Jake', lastName: 'Adit', email: 'jakeadit@example.net' };
    const certificationCenterDTO = domainBuilder.buildCenterForAdmin({
      center: {
        name: 'Centre de certif SCO',
        type: 'SCO',
        externalId: 'EXT123',
        habilitations: [],
      },
      dataProtectionOfficer: {
        ...dataProtectionOfficerInfos,
      },
    });

    // when
    const createdCertificationCenter = await usecases.createCertificationCenter({
      certificationCenter: certificationCenterDTO,
      complementaryCertificationIds: [],
    });

    // then
    const dpoInDB = await knex('data-protection-officers')
      .where({ certificationCenterId: createdCertificationCenter.id })
      .first();

    expect(dpoInDB.firstName).to.equal(dataProtectionOfficerInfos.firstName);
    expect(dpoInDB.lastName).to.equal(dataProtectionOfficerInfos.lastName);
    expect(dpoInDB.email).to.equal(dataProtectionOfficerInfos.email);

    expect(createdCertificationCenter.dataProtectionOfficerFirstName).to.equal(dataProtectionOfficerInfos.firstName);
    expect(createdCertificationCenter.dataProtectionOfficerLastName).to.equal(dataProtectionOfficerInfos.lastName);
    expect(createdCertificationCenter.dataProtectionOfficerEmail).to.equal(dataProtectionOfficerInfos.email);
  });

  it('creates and saves complementary certification habilitations', async function () {
    // given
    const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification.clea();
    const droitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification.droit();
    await databaseBuilder.commit();

    const certificationCenterDTO = domainBuilder.buildCenterForAdmin({
      center: {
        name: 'Centre de certif SCO',
        type: 'SCO',
        externalId: 'EXT123',
        habilitations: [],
      },
    });

    // when
    const createdCertificationCenter = await usecases.createCertificationCenter({
      certificationCenter: certificationCenterDTO,
      complementaryCertificationIds: [cleaComplementaryCertification.id, droitComplementaryCertification.id],
    });

    // then
    const complementaryCertificationHabilitationsInDB = await knex('complementary-certification-habilitations').where({
      certificationCenterId: createdCertificationCenter.id,
    });

    expect(complementaryCertificationHabilitationsInDB).to.have.lengthOf(2);
  });

  context('when an organizationId to attach is provided', function () {
    it('attaches the created certification center to the organization', async function () {
      // given
      const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();
      await databaseBuilder.commit();

      const certificationCenterDTO = domainBuilder.buildCenterForAdmin({
        center: {
          name: 'Centre de certif SCO',
          type: 'SCO',
          externalId: 'EXT123',
          habilitations: [],
          organizationId: organization.id,
        },
      });

      // when
      const createdCertificationCenter = await usecases.createCertificationCenter({
        certificationCenter: certificationCenterDTO,
        complementaryCertificationIds: [],
      });

      // then
      const organizationFactStructure = await knex('fct_structures')
        .where({ organization_id: organization.id })
        .first();
      expect(organizationFactStructure.certification_center_id).to.equal(createdCertificationCenter.id);
    });

    it('throws when the given organizationId does not match an existing organization', async function () {
      // given
      const nonExistingOrganizationId = 666;
      const certificationCenterDTO = domainBuilder.buildCenterForAdmin({
        center: {
          name: 'Centre de certif SCO',
          type: 'SCO',
          externalId: 'EXT123',
          habilitations: [],
          organizationId: nonExistingOrganizationId,
        },
      });

      // when
      const error = await catchErr(usecases.createCertificationCenter)({
        certificationCenter: certificationCenterDTO,
        complementaryCertificationIds: [],
      });

      // then
      expect(error).to.be.instanceof(UnableToAttachCertificationCenterToOrganization);
      expect(error.code).to.equal('ORGANIZATION_NOT_FOUND');
      expect(error.message).to.equal('Organization not found');
      expect(error.meta).to.deep.equal({ organizationId: nonExistingOrganizationId });
    });

    it('throws when the given organization already has an attached certification center', async function () {
      // given
      const alreadyAttachedCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const { organization: alreadyAttachedOrganization } = databaseBuilder.factory.buildOrganizationWithStructure({
        certificationCenterId: alreadyAttachedCertificationCenterId,
      });
      await databaseBuilder.commit();

      const certificationCenterDTO = domainBuilder.buildCenterForAdmin({
        center: {
          name: 'Centre de certif SCO',
          type: 'SCO',
          externalId: 'EXT123',
          habilitations: [],
          organizationId: alreadyAttachedOrganization.id,
        },
      });

      // when
      const error = await catchErr(usecases.createCertificationCenter)({
        certificationCenter: certificationCenterDTO,
        complementaryCertificationIds: [],
      });

      // then
      expect(error).to.be.instanceof(UnableToAttachCertificationCenterToOrganization);
      expect(error.code).to.equal('ALREADY_ATTACHED_ORGANIZATION');
      expect(error.message).to.equal('Organization already has an attached certification center');
      expect(error.meta).to.deep.equal({
        organizationId: alreadyAttachedOrganization.id,
        alreadyAttachedCertificationCenterId: alreadyAttachedCertificationCenterId,
      });
    });
  });
});
