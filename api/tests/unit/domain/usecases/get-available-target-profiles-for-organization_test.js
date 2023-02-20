import { expect, sinon } from '../../../test-helper';
import getAvailableTargetProfilesForOrganization from '../../../../lib/domain/usecases/get-available-target-profiles-for-organization';

describe('Unit | UseCase | get-available-target-profiles-for-organization', function () {
  it('returns the target profile available for the given organizations', async function () {
    const organizationId = 12;
    const expectedTargetProfiles = Symbol('TargetProfileForSpecifier');
    const TargetProfileForSpecifierRepository = { availableForOrganization: sinon.stub() };

    TargetProfileForSpecifierRepository.availableForOrganization
      .withArgs(organizationId)
      .resolves(expectedTargetProfiles);

    const targetProfiles = await getAvailableTargetProfilesForOrganization({
      organizationId,
      TargetProfileForSpecifierRepository,
    });

    expect(targetProfiles).to.equal(expectedTargetProfiles);
  });
});
