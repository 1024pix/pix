import { expect } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/organization-member-identity-serializer.js';
import { OrganizationMemberIdentity } from '../../../../../lib/domain/models/OrganizationMemberIdentity.js';

describe('Unit | Serializer | organization-members-serializer', function () {
  describe('#serialize', function () {
    it('should return a JSON API serialized organization members', function () {
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
      const serializedOrganizationMemberIdentity = serializer.serialize(members);

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
