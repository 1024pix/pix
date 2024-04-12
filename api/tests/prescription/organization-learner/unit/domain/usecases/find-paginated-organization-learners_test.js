import { findPaginatedOrganizationLearners } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-paginated-organization-learners.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | find-organisation-learner', function () {
  it('should call organization learner repository', async function () {
    // given
    const organizationId = 1234;

    const organizationLearnerRepository = {
      findPaginatedLearners: sinon.stub(),
    };

    // when
    await findPaginatedOrganizationLearners({
      organizationId,
      page: { size: 1, number: 1 },
      organizationLearnerRepository,
    });

    // then
    expect(organizationLearnerRepository.findPaginatedLearners).to.have.been.calledWithExactly({
      organizationId,
      page: { size: 1, number: 1 },
    });
  });
});
