import { expect, domainBuilder } from '../../../../../../test-helper.js';
import * as organizationPlaceLotManagementSerializer from '../../../../../../../src/prescription/organization-place/infrastructure/serializers/jsonapi/organization-places-lot-management-serializer.js';
import { OrganizationPlacesLotManagement } from '../../../../../../../src/prescription/organization-place/domain/read-models/OrganizationPlacesLotManagement.js';
import * as organizationPlacesLotCategories from '../../../../../../../src/prescription/organization-place/domain/constants/organization-places-categories.js';

describe('Unit | Serializer | JSONAPI | organization-places-lot-management-serializer', function () {
  describe('#serialize', function () {
    it('should convert an Organization model object into JSON API data', function () {
      // given
      const organizationPlaces = [
        domainBuilder.buildOrganizationPlacesLotManagement({
          id: 777,
          count: 77,
          category: organizationPlacesLotCategories.T1,
          reference: 'Independance Day',
          activationDate: new Date('1996-07-04'),
          expirationDate: new Date('2016-07-04'),
          creatorFirstName: 'Roland',
          creatorLastName: 'Emmerich',
        }),
        domainBuilder.buildOrganizationPlacesLotManagement({
          id: 666,
          count: 66,
          category: organizationPlacesLotCategories.T2,
          reference: 'Godzilla',
          activationDate: new Date('2014-05-13'),
          expirationDate: new Date('2021-07-01'),
          creatorFirstName: 'Gareth',
          creatorLastName: 'Edwards',
        }),
      ];

      const expectedJSON = {
        data: [
          {
            type: 'organization-places',
            id: organizationPlaces[0].id.toString(),
            attributes: {
              count: organizationPlaces[0].count,
              category: OrganizationPlacesLotManagement.categories.T1,
              reference: organizationPlaces[0].reference,
              'activation-date': organizationPlaces[0].activationDate,
              'expiration-date': organizationPlaces[0].expirationDate,
              'creator-full-name': organizationPlaces[0].creatorFullName,
              status: OrganizationPlacesLotManagement.statuses.EXPIRED,
            },
          },
          {
            type: 'organization-places',
            id: organizationPlaces[1].id.toString(),
            attributes: {
              count: organizationPlaces[1].count,
              category: OrganizationPlacesLotManagement.categories.T2,
              reference: organizationPlaces[1].reference,
              'activation-date': organizationPlaces[1].activationDate,
              'expiration-date': organizationPlaces[1].expirationDate,
              'creator-full-name': organizationPlaces[1].creatorFullName,
              status: OrganizationPlacesLotManagement.statuses.EXPIRED,
            },
          },
        ],
      };

      // when
      const json = organizationPlaceLotManagementSerializer.serialize(organizationPlaces);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
