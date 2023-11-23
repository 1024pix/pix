import { expect } from '../../../../../../test-helper.js';
import * as categories from '../../../../../../../src/prescription/organization-place/domain/constants/organization-places-categories.js';
import * as serializer from '../../../../../../../src/prescription/organization-place/infrastructure/serializers/jsonapi/organization-places-capacity-serializer.js';
import { OrganizationPlacesCapacity } from '../../../../../../../src/prescription/organization-place/domain/read-models/OrganizationPlacesCapacity.js';

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
