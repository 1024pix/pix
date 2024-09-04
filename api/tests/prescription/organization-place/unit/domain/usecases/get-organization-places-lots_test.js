import { getOrganizationPlacesLots } from '../../../../../../src/prescription/organization-place/domain/usecases/get-organization-places-lots.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | Use Cases | get-organization-places-lots', function () {
  it('should get the organization places lots', async function () {
    // given
    const organizationId = Symbol('organizationId');
    const placesLots = Symbol('PlacesLots');

    const organizationPlacesLotRepository = {
      findAllNotDeletedByOrganizationId: sinon.stub(),
    };

    organizationPlacesLotRepository.findAllNotDeletedByOrganizationId.withArgs(organizationId).resolves(placesLots);

    // when
    const organizationPlacesLots = await getOrganizationPlacesLots({
      organizationId,
      organizationPlacesLotRepository,
    });

    // then
    expect(organizationPlacesLots).to.equal(placesLots);
  });
});
