import * as organizationPlacesLotsSerializer from '../../../../../../../src/prescription/organization-place/infrastructure/serializers/jsonapi/organization-places-lots-serializer.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | organization-places-lot-management-serializer', function () {
  describe('#serialize', function () {
    it('should convert an Organization model object into JSON API data', function () {
      // given
      const organizationPlaces = [
        {
          id: 777,
          count: 77,
          activationDate: new Date('1996-07-04'),
          expirationDate: new Date('2016-07-04'),
          status: 'EXPIRED',
        },
        {
          id: 666,
          count: 66,
          activationDate: new Date('2014-05-13'),
          expirationDate: new Date('2021-07-01'),
          status: 'EXPIRED',
        },
      ];

      const expectedJSON = {
        data: [
          {
            type: 'organization-places-lots',
            id: organizationPlaces[0].id.toString(),
            attributes: {
              count: organizationPlaces[0].count,
              'activation-date': organizationPlaces[0].activationDate,
              'expiration-date': organizationPlaces[0].expirationDate,
              status: 'EXPIRED',
            },
          },
          {
            type: 'organization-places-lots',
            id: organizationPlaces[1].id.toString(),
            attributes: {
              count: organizationPlaces[1].count,
              'activation-date': organizationPlaces[1].activationDate,
              'expiration-date': organizationPlaces[1].expirationDate,
              status: 'EXPIRED',
            },
          },
        ],
      };

      // when
      const json = organizationPlacesLotsSerializer.serialize(organizationPlaces);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
