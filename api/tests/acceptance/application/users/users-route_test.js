const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Route | users', function () {
  describe('POST /admin/users/:id/anonymize', function () {
    it("anomymizes user, removes authentication methods and disables user's certification center and organisation memberships", async function () {
      // given
      const server = await createServer();
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const user = databaseBuilder.factory.buildUser.withRawPassword();
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: user.id,
      });
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId,
        userId: user.id,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/users/${user.id}/anonymize`,
        payload: {},
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);

      const updatedUserAttributes = response.result.data.attributes;
      const updatedUserRelationships = response.result.data.relationships;
      expect(updatedUserAttributes['first-name']).to.equal(`prenom_${user.id}`);
      expect(updatedUserAttributes['last-name']).to.equal(`nom_${user.id}`);
      expect(updatedUserAttributes.email).to.equal(`email_${user.id}@example.net`);
      expect(updatedUserAttributes.username).to.be.null;

      expect(updatedUserRelationships['authentication-methods'].data).to.be.empty;
    });
  });

  describe('PUT /admin/users/:id/unblock', function () {
    it('should unblock user how has tried to many wrong password', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser.withRawPassword().id;
      const userLoginId = databaseBuilder.factory.buildUserLogin({ userId }).id;
      const superAdmin = await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PUT',
        url: `/api/admin/users/${userId}/unblock`,
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);

      expect(response.result.data.id).to.equal(`${userLoginId}`);
      expect(response.result.data.type).to.equal('user-logins');

      expect(response.result.data.attributes['user-id']).to.equal(userId);
      expect(response.result.data.attributes['failure-count']).to.equal(0);
      expect(response.result.data.attributes['temporary-blocked-until']).to.be.null;
      expect(response.result.data.attributes['blocked-at']).to.be.null;
    });
  });
});
