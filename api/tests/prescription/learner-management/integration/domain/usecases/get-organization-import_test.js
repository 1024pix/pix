import { IMPORT_STATUSES } from '../../../../../../src/prescription/learner-management/domain/constants.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | Learner Management | get-organization-import', function () {
  let organizationId, organizationImport, userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    organizationId = databaseBuilder.factory.buildOrganization().id;
    databaseBuilder.factory.buildOrganizationImport({
      organizationId,
      createdBy: userId,
      status: IMPORT_STATUSES.UPLOAD_ERROR,
    });
    organizationImport = databaseBuilder.factory.buildOrganizationImport({
      organizationId,
      createdBy: userId,
      errors: null,
    });

    await databaseBuilder.commit();
  });

  it('should return an OrganizationImport', async function () {
    // when
    const result = await usecases.getOrganizationImport({
      organizationImportId: organizationImport.id,
    });

    // then
    expect(result).deep.equal(organizationImport);
  });
});
