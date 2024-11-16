import { OrganizationLearnerList } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerList.js';
import { deleteOrganizationLearners } from '../../../../../../src/prescription/learner-management/domain/usecases/delete-organization-learners.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | Organization Learners Management | Delete Organization Learners', function () {
  let campaignParticipationRepository;
  let organizationLearnerRepository;
  let organizationLearnerIds;
  let organizationId;
  let userId;
  let canDeleteStub;

  beforeEach(function () {
    userId = 777;
    organizationId = 123;
    organizationLearnerIds = [123, 456, 789];
    canDeleteStub = sinon.stub(OrganizationLearnerList.prototype, 'canDeleteOrganizationLearners');
    campaignParticipationRepository = {
      removeByOrganizationLearnerIds: sinon.stub(),
    };
    organizationLearnerRepository = {
      removeByIds: sinon.stub(),
      findOrganizationLearnerIdsByOrganizationId: sinon.stub().returns(organizationLearnerIds),
    };
    organizationLearnerRepository.findOrganizationLearnerIdsByOrganizationId.resolves(organizationLearnerIds);
  });

  it('should delete organization learners and their participations when all learners belong to organization', async function () {
    // given
    canDeleteStub.withArgs(organizationLearnerIds);

    // when
    await deleteOrganizationLearners({
      organizationLearnerIds,
      userId,
      organizationId,
      campaignParticipationRepository,
      organizationLearnerRepository,
    });

    expect(canDeleteStub).to.have.been.calledWith(organizationLearnerIds, userId);

    expect(organizationLearnerRepository.findOrganizationLearnerIdsByOrganizationId).to.have.been.calledWithExactly({
      organizationId,
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

  it('should not delete organization learners and their participations when all learners do not belong to organization', async function () {
    // given
    const organizationLearnerIdsPayload = [123, 456, 789, 101];
    canDeleteStub.withArgs(organizationLearnerIdsPayload).throws();

    // when
    await catchErr(deleteOrganizationLearners)({
      organizationLearnerIds: organizationLearnerIdsPayload,
      userId,
      organizationId,
      campaignParticipationRepository,
      organizationLearnerRepository,
    });

    expect(canDeleteStub).to.have.been.calledWith(organizationLearnerIdsPayload, userId);

    expect(organizationLearnerRepository.findOrganizationLearnerIdsByOrganizationId).to.have.been.calledWithExactly({
      organizationId,
    });

    expect(campaignParticipationRepository.removeByOrganizationLearnerIds).to.not.have.been.called;

    expect(organizationLearnerRepository.removeByIds).to.not.have.been.called;
  });
});
