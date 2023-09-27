import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';

describe('Unit | UseCase | compute-organization-learner-certificabilty', function () {
  let clock;

  beforeEach(async function () {
    clock = sinon.useFakeTimers({
      now: Date.now(),
      toFake: ['Date'],
    });
  });

  afterEach(async function () {
    clock.restore();
  });
  it('should update certificability for an organization learner', async function () {
    // given
    const organizationLearnerRepository = {
      get: sinon.stub(),
      updateCertificability: sinon.stub(),
    };
    const organizationLearnerId = 1;
    const organizationLearner = domainBuilder.buildOrganizationLearner({ id: organizationLearnerId });
    sinon.stub(organizationLearner, 'updateCertificability');
    organizationLearnerRepository.get.withArgs(organizationLearner.id).returns(organizationLearner);
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
