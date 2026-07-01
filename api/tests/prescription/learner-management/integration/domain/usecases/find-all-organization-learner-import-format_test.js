import { OrganizationLearnerImportFormat } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerImportFormat.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/constants.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | Learner Management | find-all-organization-learner-import-format', function () {
  let scoImportFormat, supImportFormat;

  beforeEach(async function () {
    const scoOrganizationId = databaseBuilder.factory.buildOrganization().id;
    const supOrganizationId = databaseBuilder.factory.buildOrganization().id;

    const featureId = databaseBuilder.factory.buildFeature({
      key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key,
    }).id;

    scoImportFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({ name: 'SCO' });
    supImportFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({ name: 'SUP' });

    databaseBuilder.factory.buildOrganizationFeature({
      organizationId: scoOrganizationId,
      featureId,
      params: {
        organizationLearnerImportFormatId: scoImportFormat.id,
        organizationLearnerImportFormatName: scoImportFormat.name,
      },
    });
    databaseBuilder.factory.buildOrganizationFeature({
      organizationId: supOrganizationId,
      featureId,
      params: {
        organizationLearnerImportFormatId: supImportFormat.id,
        organizationLearnerImportFormatName: supImportFormat.name,
      },
    });

    await databaseBuilder.commit();
  });

  it('should return all OrganizationLearnerImportFormat', async function () {
    // when
    const result = await usecases.findAllOrganizationLearnerImportFormats();

    // then
    expect(result).lengthOf(2);
    expect(result[0]).instanceOf(OrganizationLearnerImportFormat);
  });
});
