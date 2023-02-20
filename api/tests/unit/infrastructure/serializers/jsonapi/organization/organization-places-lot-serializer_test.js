import { expect } from '../../../../../test-helper';
import organizationPlacesLotSerializer from '../../../../../../lib/infrastructure/serializers/jsonapi/organization/organization-places-lot-serializer';
import { FREE_RATE } from '../../../../../../lib/domain/constants/organization-places-categories';

describe('Unit | Serializer | JSONAPI | organization-places-lot-serializer', function () {
  describe('#deserialize', function () {
    //given
    const jsonOrganizationPlacesSet = {
      data: {
        attributes: {
          'organization-id': 2,
          count: 10,
          'activation-date': '2022-01-02',
          'expiration-date': '2023-01-01',
          reference: 'ABC123',
          category: FREE_RATE,
          'created-by': '122',
        },
      },
    };

    const expectedJsonOrganizationPlacesSet = {
      organizationId: 2,
      count: 10,
      activationDate: '2022-01-02',
      expirationDate: '2023-01-01',
      reference: 'ABC123',
      category: FREE_RATE,
      createdBy: '122',
    };

    it('should convert JSON API data into an organization place set object', function () {
      //when
      const organizationPlaceSet = organizationPlacesLotSerializer.deserialize(jsonOrganizationPlacesSet);

      //then
      expect(organizationPlaceSet).to.be.deep.equal(expectedJsonOrganizationPlacesSet);
    });
  });
});
