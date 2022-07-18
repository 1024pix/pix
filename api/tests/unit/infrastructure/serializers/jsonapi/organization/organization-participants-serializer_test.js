const { expect } = require('../../../../../test-helper');
const OrganizationParticipant = require('../../../../../../lib/domain/read-models/OrganizationParticipant');
const serializer = require('../../../../../../lib/infrastructure/serializers/jsonapi/organization/organization-participants-serializer');

describe('Unit | Serializer | JSONAPI | organization-participants-serializer', function () {
  describe('#serialize', function () {
    it('should convert an organization participant model object into JSON API data', function () {
      // given
      const organizationParticipants = [
        new OrganizationParticipant({
          id: 777,
          firstName: 'Alex',
          lastName: 'Vasquez',
          participationCount: 4,
          lastParticipationDate: '2021-03-05',
        }),
        new OrganizationParticipant({
          id: 778,
          firstName: 'Sam',
          lastName: 'Simpson',
          participationCount: 3,
          lastParticipationDate: '2021-03-05',
        }),
      ];
      const pagination = { page: { number: 1, pageSize: 2 } };

      const expectedJSON = {
        data: [
          {
            type: 'organization-participants',
            id: organizationParticipants[0].id.toString(),
            attributes: {
              'first-name': organizationParticipants[0].firstName,
              'last-name': organizationParticipants[0].lastName,
              'participation-count': organizationParticipants[0].participationCount,
              'last-participation-date': organizationParticipants[0].lastParticipationDate,
            },
          },
          {
            type: 'organization-participants',
            id: organizationParticipants[1].id.toString(),
            attributes: {
              'first-name': organizationParticipants[1].firstName,
              'last-name': organizationParticipants[1].lastName,
              'participation-count': organizationParticipants[1].participationCount,
              'last-participation-date': organizationParticipants[1].lastParticipationDate,
            },
          },
        ],
        meta: pagination,
      };

      // when
      const json = serializer.serialize({ organizationParticipants, pagination });

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
