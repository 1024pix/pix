const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-anonymize-user', function () {
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
});
