import { expect, sinon } from '../../../../../test-helper.js';
import { getAvailableTargetProfilesForOrganization } from '../../../../../../src/prescription/target-profile/domain/usecases/get-available-target-profiles-for-organization.js';

describe('Unit | UseCase | get-available-target-profiles-for-organization', function () {
  it('returns the target profile available for the given organizations', async function () {
    const organizationId = 12;
    const expectedTargetProfiles = Symbol('TargetProfileForSpecifier');
    const targetProfileForSpecifierRepository = { availableForOrganization: sinon.stub() };

    targetProfileForSpecifierRepository.availableForOrganization
      .withArgs(organizationId)
      .resolves(expectedTargetProfiles);

    const targetProfiles = await getAvailableTargetProfilesForOrganization({
      organizationId,
      targetProfileForSpecifierRepository,
    });

    expect(targetProfiles).to.equal(expectedTargetProfiles);
  });
});
