import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertOrganizationUserWithRoleAdmin,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper';

import createServer from '../../../../server';
import OrganizationInvitation from '../../../../lib/domain/models/OrganizationInvitation';

describe('Acceptance | Route | Organizations', function () {
  describe('DELETE /api/organizations/{id}/invitations/{invitationId}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const server = await createServer();

      const { adminUser, organization } = await insertOrganizationUserWithRoleAdmin();
      const invitation = databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization.id,
        status: OrganizationInvitation.StatusType.PENDING,
      });

      const options = {
        method: 'DELETE',
        url: `/api/organizations/${organization.id}/invitations/${invitation.id}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUser.id),
        },
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('DELETE /api/admin/organizations/{organizationId}/invitations/{invitationId}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const server = await createServer();

      const adminMember = await insertUserWithRoleSuperAdmin();
      const { organization } = await insertOrganizationUserWithRoleAdmin();
      const invitation = databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization.id,
        status: OrganizationInvitation.StatusType.PENDING,
      });

      const options = {
        method: 'DELETE',
        url: `/api/admin/organizations/${organization.id}/invitations/${invitation.id}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminMember.id),
        },
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
