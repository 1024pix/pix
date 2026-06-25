import { OrganizationMemberIdentity } from '../../../../../../src/team/domain/models/OrganizationMemberIdentity.js';
import { organizationMemberIdentitySerializer } from '../../../../../../src/team/infrastructure/serializers/jsonapi/organization-member-identity.serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | organization-members-serializer', function () {
  describe('#serialize', function () {
    it('returns a JSON API serialized organization members', function () {
      // given
      const organizationMember1 = new OrganizationMemberIdentity({
        id: 123,
        firstName: 'Alain',
        lastName: 'Provist',
      });
      const organizationMember2 = new OrganizationMemberIdentity({
        id: 666,
        firstName: 'Claire',
        lastName: 'De Lune',
      });
      const members = [organizationMember1, organizationMember2];

      // when
      const serializedOrganizationMemberIdentity = organizationMemberIdentitySerializer.serialize(members);

      // then
      expect(serializedOrganizationMemberIdentity).to.deep.equal({
        data: [
          {
            type: 'member-identities',
            id: '123',
            attributes: {
              'first-name': 'Alain',
              'last-name': 'Provist',
            },
          },
          {
            type: 'member-identities',
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
