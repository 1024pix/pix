import { UserOrganizationForAdmin } from '../../../../../../src/team/domain/read-models/UserOrganizationForAdmin.js';
import { userOrganizationForAdminSerializer } from '../../../../../../src/team/infrastructure/serializers/jsonapi/user-organization-for-admin-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Team | Serializer | JSONAPI | user-organization-for-admin-serializer', function () {
  describe('#serialize', function () {
    it('serializes a user’s organization memberships', function () {
      // given
      const userOrganizationForAdmin1 = new UserOrganizationForAdmin({
        id: 42,
        organizationRole: 'MEMBER',
        organizationId: 52,
        organizationName: 'Organization 1',
        organizationType: 'SCO',
        organizationExternalId: '1234',
        lastAccessedAt: new Date('2023-03-23').toISOString(),
      });
      const userOrganizationForAdmin2 = new UserOrganizationForAdmin({
        id: 43,
        organizationRole: 'ADMIN',
        organizationId: 53,
        organizationName: 'Organization 2',
        organizationType: 'SUP',
        organizationExternalId: '5678',
      });
      const modelObjects = [userOrganizationForAdmin1, userOrganizationForAdmin2];

      // when
      const json = userOrganizationForAdminSerializer.serialize(modelObjects);

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
              'last-accessed-at': '2023-03-23T00:00:00.000Z',
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
              'last-accessed-at': undefined,
            },
            id: '43',
            type: 'organization-memberships',
          },
        ],
      });
    });
  });
});
