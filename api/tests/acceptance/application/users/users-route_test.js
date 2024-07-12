import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../test-helper.js';

describe('Acceptance | Route | users', function () {
  describe('POST /admin/users/:id/anonymize', function () {
    let server;
    let superAdmin;
    let response;
    let userId;
    let certificationCenterId;
    let organizationId;

    beforeEach(async function () {
      server = await createServer();
      superAdmin = await insertUserWithRoleSuperAdmin();
      const user = databaseBuilder.factory.buildUser.withRawPassword();
      userId = user.id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: userId,
      });
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId,
        userId: userId,
      });

      databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId });

      await databaseBuilder.commit();

      response = await server.inject({
        method: 'POST',
        url: `/api/admin/users/${userId}/anonymize`,
        payload: {},
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      });
    });

    it('anomymizes user', async function () {
      // then
      expect(response.statusCode).to.equal(200);

      const updatedUserAttributes = response.result.data.attributes;

      expect(updatedUserAttributes['first-name']).to.equal('(anonymised)');
      expect(updatedUserAttributes['last-name']).to.equal('(anonymised)');
      expect(updatedUserAttributes.email).to.equal(`email_${userId}@example.net`);
      expect(updatedUserAttributes.username).to.be.null;

      expect(updatedUserAttributes['has-been-anonymised']).to.be.true;
      expect(updatedUserAttributes['anonymised-by-full-name']).to.equal('Super Papa');
      expect(updatedUserAttributes['updated-at']).to.exist;
    });

    it('removes authentication methods', async function () {
      // then
      const updatedUserRelationships = response.result.data.relationships;
      expect(updatedUserRelationships['authentication-methods'].data).to.be.empty;
    });

    it("disables user's certification center, organization learner and organisation memberships", async function () {
      // then
      const certificationCenterMembership = await knex('certification-center-memberships')
        .select()
        .where({ certificationCenterId })
        .first();
      const organizationMembership = await knex('memberships').select().where({ organizationId }).first();
      const organizationLearnerMembership = await knex('organization-learners').select().where({ organizationId });

      expect(organizationMembership.disabledAt).not.to.be.null;
      expect(certificationCenterMembership.disabledAt).not.to.be.null;
      expect(organizationLearnerMembership.disabledAt).not.to.be.null;
    });
  });
});
