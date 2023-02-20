import { expect } from '../../../../test-helper';
import UserOrganizationForAdmin from '../../../../../lib/domain/read-models/UserOrganizationForAdmin';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/user-organization-for-admin-serializer';

describe('Unit | Serializer | JSONAPI | user-organization-for-admin-serializer', function () {
  describe('#serialize', function () {
    it('should serialize a user’s organization memberships', function () {
      // given
      const userOrganizationForAdmin1 = new UserOrganizationForAdmin({
        id: 42,
        updatedAt: '2001-01-01',
        organizationRole: 'MEMBER',
        organizationId: 52,
        organizationName: 'Organization 1',
        organizationType: 'SCO',
        organizationExternalId: '1234',
      });
      const userOrganizationForAdmin2 = new UserOrganizationForAdmin({
        id: 43,
        updatedAt: '2001-01-01',
        organizationRole: 'ADMIN',
        organizationId: 53,
        organizationName: 'Organization 2',
        organizationType: 'SUP',
        organizationExternalId: '5678',
      });
      const modelObjects = [userOrganizationForAdmin1, userOrganizationForAdmin2];

      // when
      const json = serializer.serialize(modelObjects);

      // then
      expect(json).to.be.deep.equal({
        data: [
          {
            attributes: {
              'organization-external-id': '1234',
              'organization-id': 52,
              'organization-name': 'Organization 1',
              'organization-type': 'SCO',
              'organization-role': 'MEMBER',
              'updated-at': '2001-01-01',
            },
            id: '42',
            type: 'organization-memberships',
          },
          {
            attributes: {
              'organization-external-id': '5678',
              'organization-id': 53,
              'organization-name': 'Organization 2',
              'organization-type': 'SUP',
              'organization-role': 'ADMIN',
              'updated-at': '2001-01-01',
            },
            id: '43',
            type: 'organization-memberships',
          },
        ],
      });
    });
  });
});
