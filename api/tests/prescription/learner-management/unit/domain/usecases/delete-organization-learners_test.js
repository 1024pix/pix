import { deleteOrganizationLearners } from '../../../../../../src/prescription/learner-management/domain/usecases/delete-organization-learners.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | Organization Learners Management | Delete Organization Learners', function () {
  let campaignParticipationRepository;
  let organizationLearnerRepository;

  beforeEach(function () {
    campaignParticipationRepository = {
      removeByOrganizationLearnerIds: sinon.stub(),
    };
    organizationLearnerRepository = {
      removeByIds: sinon.stub(),
    };
  });

  it('should delete organization learners and their participations', async function () {
    // given
    const userId = 777;
    const organizationLearnerIds = [123, 456, 789];

    // when
    await deleteOrganizationLearners({
      organizationLearnerIds,
      userId,
      campaignParticipationRepository,
      organizationLearnerRepository,
    });

    // then
    expect(campaignParticipationRepository.removeByOrganizationLearnerIds).to.have.been.calledWithExactly({
      organizationLearnerIds,
      userId,
    });

    expect(organizationLearnerRepository.removeByIds).to.have.been.calledWithExactly({
      organizationLearnerIds,
      userId,
    });
  });
});
