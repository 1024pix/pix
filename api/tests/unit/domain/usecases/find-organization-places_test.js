const { expect, sinon } = require('../../../test-helper');
const findOrganizationPlaces = require('../../../../lib/domain/usecases/find-organization-places');

describe('Unit | Domain | Use Cases | find-organization-places', function () {
  it('should get the organization places', async function () {
    // given
    const organizationId = Symbol('organizationId');
    const expectedOrganizationPlaces = Symbol('OrganizationPlaces');
    const organizationPlaceRepository = {
      find: sinon.stub(),
    };
    organizationPlaceRepository.find.withArgs(organizationId).resolves(expectedOrganizationPlaces);

    // when
    const organizationPlace = await findOrganizationPlaces({
      organizationId,
      organizationPlaceRepository,
    });

    // then
    expect(organizationPlace).to.equal(expectedOrganizationPlaces);
  });
});
