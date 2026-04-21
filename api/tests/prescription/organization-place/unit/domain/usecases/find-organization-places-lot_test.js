import sinon from 'sinon';

import { findOrganizationPlacesLot } from '../../../../../../src/prescription/organization-place/domain/usecases/find-organization-places-lot.js';

describe('Unit | Domain | Use Cases | find-organization-places', function () {
  it('should get the organization places', async function () {
    // given
    const organizationId = 123;
    const expectedOrganizationPlaces = Symbol('OrganizationPlaces');
    const organizationPlacesLotRepository = {
      findByOrganizationIdWithJoinedUsers: sinon.stub(),
    };
    organizationPlacesLotRepository.findByOrganizationIdWithJoinedUsers
      .withArgs(organizationId)
      .resolves(expectedOrganizationPlaces);

    // when
    const organizationPlace = await findOrganizationPlacesLot({
      organizationId,
      organizationPlacesLotRepository,
    });

    // then
    expect(organizationPlace).to.equal(expectedOrganizationPlaces);
  });
});
