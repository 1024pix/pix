import * as dataOrganizationPlaceStatisticsSerializer from '../../../../../../../src/prescription/organization-place/infrastructure/serializers/json/data-organization-places-statistics-serializer.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSON | data-organization-places-statistics-serializer', function () {
  describe('#serialize', function () {
    it('should convert an array of PlaceStatistics model object into an array of JSON data', function () {
      // given
      const firstPlacesStatistics = {
        organizationId: 1,
        organizationName: 'organizationName',
        organizationType: 'SCO',
        organizationPlacesCount: 10,
        organizationOccupiedPlacesCount: 2,
        organizationActivePlacesLotCount: 1,
      };

      const secondPlacesStatistics = {
        organizationId: 2,
        organizationName: 'secondOrganizationName',
        organizationType: 'PRO',
        organizationPlacesCount: 5,
        organizationOccupiedPlacesCount: 1,
        organizationActivePlacesLotCount: 1,
      };

      const dataOrganizationPlacesStatistics = [firstPlacesStatistics, secondPlacesStatistics];

      const expectedJSON = [
        {
          organization_id: firstPlacesStatistics.organizationId,
          organization_type: firstPlacesStatistics.organizationType,
          organization_name: firstPlacesStatistics.organizationName,
          organization_places_count: firstPlacesStatistics.organizationPlacesCount,
          organization_occupied_places_count: firstPlacesStatistics.organizationOccupiedPlacesCount,
          organization_active_places_lot_count: firstPlacesStatistics.organizationActivePlacesLotCount,
        },
        {
          organization_id: secondPlacesStatistics.organizationId,
          organization_type: secondPlacesStatistics.organizationType,
          organization_name: secondPlacesStatistics.organizationName,
          organization_places_count: secondPlacesStatistics.organizationPlacesCount,
          organization_occupied_places_count: secondPlacesStatistics.organizationOccupiedPlacesCount,
          organization_active_places_lot_count: secondPlacesStatistics.organizationActivePlacesLotCount,
        },
      ];

      // when
      const json = dataOrganizationPlaceStatisticsSerializer.serialize(dataOrganizationPlacesStatistics);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
