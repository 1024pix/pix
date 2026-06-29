import sinon from 'sinon';

import { findPaginatedOrganizationLearners } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-paginated-organization-learners.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | UseCase | find-paginated-organisation-learners', function () {
  it('should call organization learner repository', async function () {
    // given
    const organizationId = 1234;

    const organizationLearnerRepository = {
      findPaginatedLearnersByOrganizationId: sinon.stub(),
    };

    // when
    await findPaginatedOrganizationLearners({
      organizationId,
      page: { size: 1, number: 1 },
      filter: { 'Libellé classe': ['div'] },
      organizationLearnerRepository,
    });

    // then
    expect(organizationLearnerRepository.findPaginatedLearnersByOrganizationId).to.have.been.calledWithExactly({
      organizationId,
      page: { size: 1, number: 1 },
      filter: { 'Libellé classe': ['div'] },
    });
  });
});
