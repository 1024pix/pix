const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/organization-members-serializer');
const OrganizationMember = require('../../../../../lib/domain/models/OrganizationMember');

describe('Unit | Serializer | organization-members-serializer', function () {
  describe('#serialize', function () {
    it('should return a JSON API serialized organization members', function () {
      // given
      const organizationMember1 = new OrganizationMember({
        id: 123,
        firstName: 'Alain',
        lastName: 'Provist',
      });
      const organizationMember2 = new OrganizationMember({
        id: 666,
        firstName: 'Claire',
        lastName: 'De Lune',
      });
      const members = [organizationMember1, organizationMember2];

      // when
      const serializedOrganizationMembers = serializer.serialize(members);

      // then
      expect(serializedOrganizationMembers).to.deep.equal({
        data: [
          {
            type: 'members',
            id: '123',
            attributes: {
              'first-name': 'Alain',
              'last-name': 'Provist',
            },
          },
          {
            type: 'members',
            id: '666',
            attributes: {
              'first-name': 'Claire',
              'last-name': 'De Lune',
            },
          },
        ],
      });
    });
  });
});
