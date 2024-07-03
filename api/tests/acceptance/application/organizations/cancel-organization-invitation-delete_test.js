import { OrganizationInvitation } from '../../../../src/team/domain/models/OrganizationInvitation.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertOrganizationUserWithRoleAdmin,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper.js';

describe('Acceptance | Route | Organizations', function () {
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
