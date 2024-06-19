import { findPaginatedFilteredOrganizationByTargetProfileId } from '../../../../../../src/prescription/target-profile/domain/usecases/find-paginated-filtered-target-profile-organizations.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | Target Profile | find-paginated-filtered-target-profile-organizations', function () {
  let organizationRepository;

  beforeEach(function () {
    organizationRepository = {
      findPaginatedFilteredByTargetProfile: sinon.stub(),
    };
  });

  it('should detach organizations from target profile', async function () {
    // given
    const targetProfileId = Symbol('targetProfileId');
    const filter = Symbol('filter');
    const page = Symbol('page');

    // when
    await findPaginatedFilteredOrganizationByTargetProfileId({
      targetProfileId,
      filter,
      page,
      organizationRepository,
    });

    // then
    expect(organizationRepository.findPaginatedFilteredByTargetProfile).to.have.been.calledWithMatch({
      targetProfileId,
      filter,
      page,
    });
  });
});
