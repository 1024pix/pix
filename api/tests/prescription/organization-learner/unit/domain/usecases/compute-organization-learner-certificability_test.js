import sinon from 'sinon';

import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | compute-organization-learner-certificabilty', function () {
  beforeEach(async function () {
    sinon.useFakeTimers({
      now: Date.now(),
      toFake: ['Date'],
    });
  });

  it('should update certificability for an organization learner', async function () {
    // given
    const organizationLearnerRepository = {
      getLearnerInfo: sinon.stub(),
      updateCertificability: sinon.stub(),
    };
    const organizationLearnerId = 1;
    const organizationLearner = domainBuilder.buildOrganizationLearner({ id: organizationLearnerId });
    sinon.stub(organizationLearner, 'updateCertificability');
    organizationLearnerRepository.getLearnerInfo.withArgs(organizationLearner.id).returns(organizationLearner);
    const placementProfileService = {
      getPlacementProfile: sinon.stub(),
    };

    const placementProfile = domainBuilder.buildPlacementProfile({ userId: organizationLearner.userId });
    placementProfileService.getPlacementProfile
      .withArgs({ userId: organizationLearner.userId, limitDate: new Date().toISOString() })
      .returns(placementProfile);

    // when
    await usecases.computeOrganizationLearnerCertificability({
      organizationLearnerId,
      organizationLearnerRepository,
      placementProfileService,
    });

    // then
    expect(organizationLearner.updateCertificability).to.have.been.calledWithExactly(placementProfile);
    expect(organizationLearnerRepository.updateCertificability).to.have.been.calledWithExactly(organizationLearner);
  });
});
