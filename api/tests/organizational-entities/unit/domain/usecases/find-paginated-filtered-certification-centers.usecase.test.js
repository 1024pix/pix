import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { CertificationCenter } from '../../../../../src/shared/domain/models/index.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Domain | UseCase | find-paginated-filtered-certification-centers', function () {
  it('should return certification-centers with filtering and pagination', async function () {
    // given
    const filter = { name: 'Dragon' };
    const page = { number: 1, size: 2 };

    const resolvedPagination = { page: 1, pageSize: 2, itemsCount: 3, pagesCount: 2 };
    const matchingCertificationCenters = [
      new CertificationCenter({ id: 1 }),
      new CertificationCenter({ id: 2 }),
      new CertificationCenter({ id: 3 }),
    ];
    const certificationCenterRepository = {
      findPaginatedFiltered: sinon.stub(),
    };
    certificationCenterRepository.findPaginatedFiltered
      .withArgs({ filter, page })
      .resolves({ models: matchingCertificationCenters, pagination: resolvedPagination });

    // when
    const response = await usecases.findPaginatedFilteredCertificationCenters({
      filter,
      page,
      certificationCenterRepository,
    });

    // then
    expect(response.models).to.equal(matchingCertificationCenters);
    expect(response.pagination.page).to.equal(resolvedPagination.page);
    expect(response.pagination.pageSize).to.equal(resolvedPagination.pageSize);
    expect(response.pagination.itemsCount).to.equal(resolvedPagination.itemsCount);
    expect(response.pagination.pagesCount).to.equal(resolvedPagination.pagesCount);
  });
});
