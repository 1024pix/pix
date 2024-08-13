import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { OrganizationLearnerCannotBeDissociatedError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | dissociate-user-from-organization-learner', function () {
  const organizationId = 1;
  const organizationLearnerId = 2;

  let organizationLearnerRepositoryStub, organizationFeatureRepositoryStub;

  beforeEach(function () {
    domainBuilder.buildOrganizationLearner({
      organization: { id: organizationId },
      id: organizationLearnerId,
    });

    organizationFeatureRepositoryStub = {
      hasLearnersImportFeature: sinon.stub(),
    };
    organizationLearnerRepositoryStub = {
      dissociateUserFromOrganizationLearner: sinon.stub(),
      getOrganizationLearnerForAdmin: sinon.stub(),
    };
  });

  it('should dissociate user from the organization learner', async function () {
    // given
    organizationLearnerRepositoryStub.getOrganizationLearnerForAdmin
      .withArgs(organizationLearnerId)
      .resolves({ organizationId, canBeDissociated: true });

    // when
    await usecases.dissociateUserFromOrganizationLearner({
      organizationLearnerId,
      organizationLearnerRepository: organizationLearnerRepositoryStub,
      organizationFeatureRepository: organizationFeatureRepositoryStub,
    });

    // then
    expect(organizationLearnerRepositoryStub.dissociateUserFromOrganizationLearner).to.be.have.been.calledWithExactly(
      organizationLearnerId,
    );
  });

  it('should dissociate user from the organization learner when organization has import feature', async function () {
    // given
    organizationLearnerRepositoryStub.getOrganizationLearnerForAdmin
      .withArgs(organizationLearnerId)
      .resolves({ organizationId, canBeDissociated: false });
    organizationFeatureRepositoryStub.hasLearnersImportFeature.withArgs({ organizationId }).resolves(true);

    // when
    await usecases.dissociateUserFromOrganizationLearner({
      organizationLearnerId,
      organizationLearnerRepository: organizationLearnerRepositoryStub,
      organizationFeatureRepository: organizationFeatureRepositoryStub,
    });

    // then
    expect(organizationLearnerRepositoryStub.dissociateUserFromOrganizationLearner).to.be.have.been.calledWithExactly(
      organizationLearnerId,
    );
  });

  it('should throw an error when organization learner cannot be dissociated and organization does not have import feature', async function () {
    // given
    organizationLearnerRepositoryStub.getOrganizationLearnerForAdmin
      .withArgs(organizationLearnerId)
      .resolves({ organizationId, canBeDissociated: false });
    organizationFeatureRepositoryStub.hasLearnersImportFeature.withArgs({ organizationId }).resolves(false);

    // when
    const error = await catchErr(usecases.dissociateUserFromOrganizationLearner)({
      organizationLearnerId,
      organizationLearnerRepository: organizationLearnerRepositoryStub,
      organizationFeatureRepository: organizationFeatureRepositoryStub,
    });

    // then
    expect(error).to.be.instanceOf(OrganizationLearnerCannotBeDissociatedError);
  });
});
