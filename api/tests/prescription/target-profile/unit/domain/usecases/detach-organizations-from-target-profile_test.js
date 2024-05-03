import { detachOrganizationsFromTargetProfile } from '../../../../../../src/prescription/target-profile/domain/usecases/detach-organizations-from-target-profile.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | Target Profile Management | Detach Organizations From Target Profile', function () {
  let targetProfileBondRepository;

  beforeEach(function () {
    targetProfileBondRepository = {
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
      targetProfileBondRepository,
    });

    // then
    expect(targetProfileBondRepository.update).to.have.been.calledWithMatch({
      id: targetProfileId,
      organizationIdsToDetach: organizationIds,
    });
  });
});
