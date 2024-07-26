import * as usecase from '../../../../../src/shared/application/usecases/checkUserBelongsToLearnersOrganization.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Use Case | checkUserBelongsToLearnersOrganization', function () {
  let membershipRepositoryStub;
  let organizationLearnerRepositoryStub;

  beforeEach(function () {
    membershipRepositoryStub = {
      findByUserIdAndOrganizationId: sinon.stub(),
    };
    organizationLearnerRepositoryStub = {
      get: sinon.stub(),
    };
  });

  it('should return true when user belongs to the same organization as learner', async function () {
    // given
    const userId = 1234;
    const organizationLearnerId = 5678;

    const sharedOrganization = domainBuilder.buildOrganization();

    const membership = domainBuilder.buildMembership({ organization: sharedOrganization });
    const organizationLearner = domainBuilder.buildOrganizationLearner({
      id: organizationLearnerId,
      organization: sharedOrganization,
    });
    organizationLearnerRepositoryStub.get.resolves(organizationLearner);
    membershipRepositoryStub.findByUserIdAndOrganizationId.resolves([membership]);

    // when
    const response = await usecase.execute(userId, organizationLearnerId, {
      membershipRepository: membershipRepositoryStub,
      organizationLearnerRepository: organizationLearnerRepositoryStub,
    });

    // then
    expect(response).to.equal(true);
    expect(membershipRepositoryStub.findByUserIdAndOrganizationId).to.have.been.calledWithExactly({
      userId,
      organizationId: sharedOrganization.id,
    });
  });

  it("should return false when user is not a member of the learner's organization", async function () {
    // given
    const userId = 1234;
    const organizationLearnerId = 5678;

    const anotherOrganization = domainBuilder.buildOrganization();

    const organizationLearner = domainBuilder.buildOrganizationLearner({
      id: organizationLearnerId,
      anotherOrganization,
    });
    organizationLearnerRepositoryStub.get.resolves(organizationLearner);
    membershipRepositoryStub.findByUserIdAndOrganizationId.resolves([]);

    // when
    const response = await usecase.execute(userId, organizationLearnerId, {
      membershipRepository: membershipRepositoryStub,
      organizationLearnerRepository: organizationLearnerRepositoryStub,
    });

    // then
    expect(response).to.equal(false);
    expect(membershipRepositoryStub.findByUserIdAndOrganizationId).to.have.been.calledWithExactly({
      userId,
      organizationId: anotherOrganization.id,
    });
  });
});
