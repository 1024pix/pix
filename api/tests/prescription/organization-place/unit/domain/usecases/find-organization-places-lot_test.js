import { expect, sinon } from '../../../../../test-helper.js';
import { findOrganizationPlacesLot as findOrganizationPlaceLot } from '../../../../../../src/prescription/organization-place/domain/usecases/find-organization-places-lot.js';

describe('Unit | Domain | Use Cases | find-organization-places', function () {
  it('should get the organization places', async function () {
    // given
    const organizationId = Symbol('organizationId');
    const expectedOrganizationPlaces = Symbol('OrganizationPlaces');
    const organizationPlacesLotRepository = {
      findByOrganizationId: sinon.stub(),
    };
    organizationPlacesLotRepository.findByOrganizationId.withArgs(organizationId).resolves(expectedOrganizationPlaces);

    // when
    const organizationPlace = await findOrganizationPlaceLot({
      organizationId,
      organizationPlacesLotRepository,
    });

    // then
    expect(organizationPlace).to.equal(expectedOrganizationPlaces);
  });
});
