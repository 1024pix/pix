import { expect, sinon } from '../../../test-helper';
import findOrganizationPlaceLot from '../../../../lib/domain/usecases/find-organization-places-lot';

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
