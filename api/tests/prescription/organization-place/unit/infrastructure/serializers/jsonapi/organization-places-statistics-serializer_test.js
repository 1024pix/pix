import dayjs from 'dayjs';

import { PlacesLot } from '../../../../../../../src/prescription/organization-place/domain/read-models/PlacesLot.js';
import { PlaceStatistics } from '../../../../../../../src/prescription/organization-place/domain/read-models/PlaceStatistics.js';
import { organizationPlacesStatisticsSerializer } from '../../../../../../../src/prescription/organization-place/infrastructure/serializers/jsonapi/organization-places-statistics-serializer.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | organization-places-statistics-serializer', function () {
  describe('#serialize', function () {
    it('should convert a PlaceStatistics entity into JSON API data', function () {
      // given
      const placeStatistics = new PlaceStatistics({
        placesLots: [
          new PlacesLot({
            id: 1,
            count: 10,
            expirationDate: dayjs().add(1, 'months').toDate(),
            activationDate: new Date('2019-04-01'),
            deletedAt: null,
          }),
        ],
        placeRepartition: { totalUnRegisteredParticipant: 3, totalRegisteredParticipant: 2 },
        organizationId: 22,
      });

      const expectedJSON = {
        data: {
          type: 'organization-place-statistics',
          id: '22_place_statistics',
          attributes: {
            total: 10,
            occupied: 5,
            available: 5,
            'anonymous-seat': 3,
            'has-reached-maximum-places-limit': false,
          },
        },
      };

      // when
      const json = organizationPlacesStatisticsSerializer.serialize(placeStatistics);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
