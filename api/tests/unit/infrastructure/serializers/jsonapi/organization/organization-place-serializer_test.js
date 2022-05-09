const { expect, domainBuilder } = require('../../../../../test-helper');
const serializer = require('../../../../../../lib/infrastructure/serializers/jsonapi/organization/organization-place-serializer');
const OrganizationPlace = require('../../../../../../lib/domain/read-models/OrganizationPlace');
describe('Unit | Serializer | JSONAPI | organization-place-serializer', function () {
  describe('#serialize', function () {
    it('should convert an Organization model object into JSON API data', function () {
      // given
      const organizationPlaces = [
        domainBuilder.buildOrganizationPlace({
          id: 777,
          count: 77,
          category: 'T1',
          reference: 'Independance Day',
          activationDate: new Date('1996-07-04'),
          expiredDate: new Date('2016-07-04'),
          creatorFirstName: 'Roland',
          creatorLastName: 'Emmerich',
        }),
        domainBuilder.buildOrganizationPlace({
          id: 666,
          count: 66,
          category: 'T2',
          reference: 'Godzilla',
          activationDate: new Date('2014-05-13'),
          expiredDate: new Date('2021-07-01'),
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
              category: OrganizationPlace.categories.T1,
              reference: organizationPlaces[0].reference,
              'activation-date': organizationPlaces[0].activationDate,
              'expired-date': organizationPlaces[0].expiredDate,
              'creator-full-name': organizationPlaces[0].creatorFullName,
              status: OrganizationPlace.statuses.EXPIRED,
            },
          },
          {
            type: 'organization-places',
            id: organizationPlaces[1].id.toString(),
            attributes: {
              count: organizationPlaces[1].count,
              category: OrganizationPlace.categories.T2,
              reference: organizationPlaces[1].reference,
              'activation-date': organizationPlaces[1].activationDate,
              'expired-date': organizationPlaces[1].expiredDate,
              'creator-full-name': organizationPlaces[1].creatorFullName,
              status: OrganizationPlace.statuses.EXPIRED,
            },
          },
        ],
      };

      // when
      const json = serializer.serialize(organizationPlaces);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
