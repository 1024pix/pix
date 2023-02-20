import { expect } from '../../../../../test-helper';
import categories from '../../../../../../lib/domain/constants/organization-places-categories';
import serializer from '../../../../../../lib/infrastructure/serializers/jsonapi/organization-places-capacity-serializer';
import OrganizationPlacesCapacity from '../../../../../../lib/domain/read-models/OrganizationPlacesCapacity';

describe('Unit | Serializer | JSONAPI | organization-places-capacity-serializer', function () {
  describe('#serialize', function () {
    it('should convert an organization participant model object into JSON API data', function () {
      // given
      const organizationPlacesCapacity = new OrganizationPlacesCapacity({
        organizationId: 1,
        placesLots: [{ category: categories.T0, count: 10 }],
      });

      const expectedJSON = {
        data: {
          attributes: {
            categories: [
              { category: categories.FREE_RATE, count: 10 },
              { category: categories.PUBLIC_RATE, count: 0 },
              { category: categories.REDUCE_RATE, count: 0 },
              { category: categories.SPECIAL_REDUCE_RATE, count: 0 },
              { category: categories.FULL_RATE, count: 0 },
            ],
          },
          id: '1_places_capacity',
          type: 'organization-places-capacities',
        },
      };

      // when
      const json = serializer.serialize(organizationPlacesCapacity);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
