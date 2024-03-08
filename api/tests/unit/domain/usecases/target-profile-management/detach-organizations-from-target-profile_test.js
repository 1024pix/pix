import { detachOrganizationsFromTargetProfile } from '../../../../../lib/domain/usecases/target-profile-management/detach-organizations-from-target-profile.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | UseCase | Target Profile Management | Detach Organizations From Target Profile', function () {
  let targetProfileRepository;

  beforeEach(function () {
    targetProfileRepository = {
      update: sinon.stub(),
    };
  });

  it('should detach organizations from target profile', async function () {
    // given
    const targetProfileId = 777;
    const organizationIds = [123, 456, 789];

    // when
    await detachOrganizationsFromTargetProfile({
      organizationIds,
      targetProfileId,
      targetProfileRepository,
    });

    // then
    expect(targetProfileRepository.update).to.have.been.calledWithMatch({
      id: targetProfileId,
      organizationIdsToDetach: organizationIds,
    });
  });
});
