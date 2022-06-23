const { expect, domainBuilder } = require('../../../../../test-helper');
const serializer = require('../../../../../../lib/infrastructure/serializers/jsonapi/organization/organization-participants-serializer');
describe('Unit | Serializer | JSONAPI | organization-participants-serializer', function () {
  describe('#serialize', function () {
    it('should convert an organization participant model object into JSON API data', function () {
      // given
      const organizationParticipants = [
        domainBuilder.buildOrganizationLearner({
          id: 777,
          organizationId: 2,
        }),
        domainBuilder.buildOrganizationLearner({
          id: 778,
          organizationId: 2,
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
            },
          },
          {
            type: 'organization-participants',
            id: organizationParticipants[1].id.toString(),
            attributes: {
              'first-name': organizationParticipants[1].firstName,
              'last-name': organizationParticipants[1].lastName,
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
