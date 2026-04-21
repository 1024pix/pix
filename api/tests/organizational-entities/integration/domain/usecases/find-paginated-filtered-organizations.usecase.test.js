import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Organizational Entities | Domain | UseCase | find-paginated-filtered-organizations', function () {
  it('should result organizations with filtering and pagination', async function () {
    // given
    const administrationTeam = databaseBuilder.factory.buildAdministrationTeam();
    databaseBuilder.factory.buildOrganization({
      name: 'Dragon 1',
      administrationTeamId: administrationTeam.id,
    });
    databaseBuilder.factory.buildOrganization({
      name: 'Dragon 2',
      administrationTeamId: administrationTeam.id,
    });
    databaseBuilder.factory.buildOrganization({ name: 'Licorne' });
    await databaseBuilder.commit();

    const filter = { name: 'Dragon' };
    const page = { number: 1, size: 2 };

    const resolvedPagination = { page: 1, pageSize: 2, rowCount: 2, pageCount: 1 };

    // when
    const response = await usecases.findPaginatedFilteredOrganizations({ filter, page });

    // then
    expect(response.models[0]).to.be.an.instanceOf(OrganizationForAdmin);
    expect(response.models[1]).to.be.an.instanceOf(OrganizationForAdmin);
    expect(response.pagination.page).to.equal(resolvedPagination.page);
    expect(response.pagination.pageSize).to.equal(resolvedPagination.pageSize);
    expect(response.pagination.rowCount).to.equal(resolvedPagination.rowCount);
    expect(response.pagination.pageCount).to.equal(resolvedPagination.pageCount);
  });
});
