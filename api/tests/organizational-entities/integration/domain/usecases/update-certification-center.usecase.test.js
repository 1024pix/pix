import { expect } from 'chai';

import { StructureCategoryNotFound } from '../../../../../src/organizational-entities/domain/errors.js';
import { CenterForAdmin } from '../../../../../src/organizational-entities/domain/models/CenterForAdmin.js';
import { updateCertificationCenter } from '../../../../../src/organizational-entities/domain/usecases/update-certification-center.usecase.js';
import * as certificationCenterRepository from '../../../../../src/organizational-entities/infrastructure/repositories/certification-center.repository.js';
import * as certificationCenterForAdminRepository from '../../../../../src/organizational-entities/infrastructure/repositories/certification-center-for-admin.repository.js';
import * as complementaryCertificationHabilitationRepository from '../../../../../src/organizational-entities/infrastructure/repositories/complementary-certification-habilitation.repository.js';
import * as dataProtectionOfficerRepository from '../../../../../src/organizational-entities/infrastructure/repositories/data-protection-officer.repository.js';
import * as structureCategoryRepository from '../../../../../src/organizational-entities/infrastructure/repositories/structure-category-repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCases | update-certification-center', function () {
  it('updates certification center and its data protection officer information', async function () {
    // given
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    databaseBuilder.factory.buildDataProtectionOfficer.withCertificationCenterId({
      firstName: 'Eddy',
      lastName: 'Taurial',
      email: 'eddy.taurial@example.net',
      certificationCenterId,
    }).id;

    const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
    const certificationCenterInformation = domainBuilder.buildCenterForAdmin({
      center: {
        id: certificationCenterId,
        name: 'Pix Super Center',
        type: 'PRO',
        habilitations: [],
      },
      dataProtectionOfficer: {
        firstName: 'Justin',
        lastName: 'Ptipeu',
        email: 'justin.ptipeu@example.net',
      },
    });
    const complementaryCertificationIds = [complementaryCertification.id];

    await databaseBuilder.commit();

    // when
    const updatedCertificationCenter = await updateCertificationCenter({
      certificationCenterId,
      certificationCenterInformation,
      complementaryCertificationIds,
      certificationCenterForAdminRepository,
      complementaryCertificationHabilitationRepository,
      dataProtectionOfficerRepository,
      certificationCenterRepository,
      structureCategoryRepository,
    });

    // then
    expect(updatedCertificationCenter).to.be.an.instanceOf(CenterForAdmin);

    expect(updatedCertificationCenter.name).to.equal('Pix Super Center');

    expect(updatedCertificationCenter.dataProtectionOfficerFirstName).to.equal('Justin');
    expect(updatedCertificationCenter.dataProtectionOfficerLastName).to.equal('Ptipeu');
    expect(updatedCertificationCenter.dataProtectionOfficerEmail).to.equal('justin.ptipeu@example.net');

    expect(updatedCertificationCenter.habilitations).to.have.lengthOf(1);
    expect(updatedCertificationCenter.habilitations[0].complementaryCertificationId).to.equal(
      complementaryCertification.id,
    );
    expect(updatedCertificationCenter.habilitations[0].key).to.equal(complementaryCertification.key);
    expect(updatedCertificationCenter.habilitations[0].label).to.equal(complementaryCertification.label);
  });

  it('updates certification center category and returns it', async function () {
    // given
    const category = databaseBuilder.factory.buildStructureCategory({ label: 'Établissement scolaire' });
    const { certificationCenter } = databaseBuilder.factory.buildCertificationCenterWithStructure();
    const certificationCenterInformation = domainBuilder.buildCenterForAdmin({
      center: {
        id: certificationCenter.id,
        name: 'Pix Super Center',
        type: 'PRO',
        habilitations: [],
        categoryId: category.id,
      },
    });

    await databaseBuilder.commit();

    // when
    const updatedCertificationCenter = await updateCertificationCenter({
      certificationCenterId: certificationCenter.id,
      certificationCenterInformation,
      complementaryCertificationIds: [],
      certificationCenterForAdminRepository,
      complementaryCertificationHabilitationRepository,
      dataProtectionOfficerRepository,
      certificationCenterRepository,
      structureCategoryRepository,
    });

    // then
    expect(updatedCertificationCenter.categoryId).to.equal(category.id);
    expect(updatedCertificationCenter.categoryLabel).to.equal('Établissement scolaire');
  });

  it('throws a StructureCategoryNotFound error when the category does not exist', async function () {
    // given
    const unknownCategoryId = 999999;
    const { certificationCenter } = databaseBuilder.factory.buildCertificationCenterWithStructure();
    const certificationCenterInformation = domainBuilder.buildCenterForAdmin({
      center: {
        id: certificationCenter.id,
        name: 'Pix Super Center',
        type: 'PRO',
        habilitations: [],
        categoryId: unknownCategoryId,
      },
    });

    await databaseBuilder.commit();

    // when
    const error = await catchErr(updateCertificationCenter)({
      certificationCenterId: certificationCenter.id,
      certificationCenterInformation,
      complementaryCertificationIds: [],
      certificationCenterForAdminRepository,
      complementaryCertificationHabilitationRepository,
      dataProtectionOfficerRepository,
      certificationCenterRepository,
      structureCategoryRepository,
    });

    // then
    expect(error).to.be.instanceOf(StructureCategoryNotFound);
    expect(error.meta.structureCategoryId).to.equal(unknownCategoryId);
  });
});
