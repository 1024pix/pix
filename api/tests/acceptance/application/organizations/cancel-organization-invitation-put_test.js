const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertOrganizationUserWithRoleAdmin,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');

describe('Acceptance | Route | Organizations', function () {
  describe('PUT /api/organizations/{id}/invitations/{invitationId}/cancel', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();

      const { adminUser, organization } = await insertOrganizationUserWithRoleAdmin();

      const invitation = databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization.id,
        status: OrganizationInvitation.StatusType.PENDING,
      });

      const options = {
        method: 'PUT',
        url: `/api/organizations/${organization.id}/invitations/${invitation.id}/cancel`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUser.id),
        },
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
