import { expect } from '../../../../../../test-helper.js';
import * as organizationPlaceStatisticsSerializer from '../../../../../../../src/prescription/organization-place/infrastructure/serializers/jsonapi/organization-places-statistics-serializer.js';

describe('Unit | Serializer | JSONAPI | organization-places-statistics-serializer', function () {
  describe('#serialize', function () {
    it('should convert an PlaceStatistics model object into JSON API data', function () {
      // given
      const placeStatistics = {
        id: '1_place_statistics',
        total: 10,
        occupied: 5,
        available: 5,
      };

      const expectedJSON = {
        data: {
          type: 'organization-place-statistics',
          id: '1_place_statistics',
          attributes: {
            total: placeStatistics.total,
            occupied: placeStatistics.occupied,
            available: placeStatistics.available,
          },
        },
      };

      // when
      const json = organizationPlaceStatisticsSerializer.serialize(placeStatistics);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
