import sinon from 'sinon';

import { getOrganizationPlacesLots } from '../../../../../../src/prescription/organization-place/domain/usecases/get-organization-places-lots.js';

describe('Unit | Domain | Use Cases | get-organization-places-lots', function () {
  it('should get the organization places lots', async function () {
    // given
    const organizationId = 123;
    const placesLots = Symbol('PlacesLots');

    const organizationPlacesLotRepository = {
      findAllByOrganizationIds: sinon.stub(),
    };

    await organizationPlacesLotRepository.findAllByOrganizationIds
      .withArgs({ organizationIds: [organizationId], callOrderByAndRemoveDeleted: true })
      .resolves(placesLots);

    // when
    const organizationPlacesLots = await getOrganizationPlacesLots({
      organizationId,
      organizationPlacesLotRepository,
    });

    // then
    expect(organizationPlacesLots).to.equal(placesLots);
  });
});
