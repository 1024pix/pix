import { Organization } from '../../../../../src/organizational-entities/domain/models/Organization.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | UseCases | get-organization-by-id', function () {
  it('should get the organization by its id', async function () {
    // given
    const organization = databaseBuilder.factory.buildOrganization();
    await databaseBuilder.commit();

    const result = await usecases.getOrganizationById({ id: organization.id });

    expect(result).to.be.instanceOf(Organization);
    expect(result.id).to.equal(organization.id);
  });

  it('should throw NotFound if organization does not exist', async function () {
    // given
    const error = await catchErr(usecases.getOrganizationById)({ id: 1 });

    expect(error).to.be.instanceOf(NotFoundError);
  });
});
