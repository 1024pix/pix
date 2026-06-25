import dayjs from 'dayjs';

import { PlacesStatistics } from '../../../../../../../src/organizational-entities/domain/read-models/PlacesStatistics.js';
import { organizationPlacesStatisticsSerializer } from '../../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/organizations-administration/organization-places-statistics.serializer.js';
import { PlacesLot } from '../../../../../../../src/prescription/organization-place/domain/read-models/PlacesLot.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Infrastructure | Serializers | JSONAPI | Organizations-Administrations | organization-places-statistics', function () {
  describe('#serialize', function () {
    it('should convert a PlacesStatistics entity into JSON API data', function () {
      // given
      const placesStatistics = new PlacesStatistics({
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
          type: 'organization-places-statistics',
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
      const json = organizationPlacesStatisticsSerializer.serialize(placesStatistics);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
