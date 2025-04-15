import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Organizational Entities | Domain | UseCase | archive-organization', function () {
  it('should result organizations with filtering and pagination', async function () {
    // given
    const orga1 = databaseBuilder.factory.buildOrganization({ name: 'Dragon 1' });
    const orga2 = databaseBuilder.factory.buildOrganization({ name: 'Dragon 2' });
    databaseBuilder.factory.buildOrganization({ name: 'Licorne' });
    await databaseBuilder.commit();

    const filter = { name: 'Dragon' };
    const page = { number: 1, size: 2 };

    const resolvedPagination = { page: 1, pageSize: 2, rowCount: 2, pageCount: 1 };

    // when
    const response = await usecases.findPaginatedFilteredOrganizations({ filter, page });

    // then
    expect(response.models).to.deep.include.members([new OrganizationForAdmin(orga1), new OrganizationForAdmin(orga2)]);
    expect(response.pagination.page).to.equal(resolvedPagination.page);
    expect(response.pagination.pageSize).to.equal(resolvedPagination.pageSize);
    expect(response.pagination.rowCount).to.equal(resolvedPagination.rowCount);
    expect(response.pagination.pageCount).to.equal(resolvedPagination.pageCount);
  });
});
