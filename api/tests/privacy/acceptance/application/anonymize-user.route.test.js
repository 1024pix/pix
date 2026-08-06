import { createServer } from '../../../../server.js';
import { featureToggles } from '../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Privacy | Application | Route | anonymize-user', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/users/{id}/anonymize', function () {
    let superAdmin;
    let response;
    let userId;
    let certificationCenterId;
    let organizationId;

    beforeEach(async function () {
      superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      userId = databaseBuilder.factory.buildUser.withRawPassword().id;
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
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });
    });

    it('anomymizes user', async function () {
      // then
      expect(response.statusCode).to.equal(204);

      const user = await knex('users').where({ id: userId }).first();
      expect(user.firstName).to.equal('(anonymised)');
      expect(user.lastName).to.equal('(anonymised)');
      expect(user.email).to.be.null;
      expect(user.username).to.be.null;
      expect(user.hasBeenAnonymised).to.be.true;
    });

    it('removes authentication methods', async function () {
      // then
      expect(response.statusCode).to.equal(204);

      const authenticationMethods = await knex('authentication-methods').where({ userId });
      expect(authenticationMethods.length).to.equal(0);
    });

    it("disables user's certification center, organization learner and organisation memberships", async function () {
      // then
      expect(response.statusCode).to.equal(204);
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

  describe('DELETE /api/users/me', function () {
    it('anonymizes the user and returns a 204 HTTP status code', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/users/me',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      });

      // then
      expect(response.statusCode).to.equal(204);

      const user = await knex('users').select().where({ id: userId }).first();
      expect(user.hasBeenAnonymised).to.be.true;
    });

    context('when user is not authenticated', function () {
      it('returns a 401 HTTP status code', async function () {
        // when
        const response = await server.inject({
          method: 'DELETE',
          url: '/api/users/me',
          headers: generateAuthenticatedUserRequestHeaders({ userId: null }),
        });

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when user cannot self delete their account', function () {
      it('returns a 403 HTTP status code', async function () {
        // given
        await featureToggles.set('isSelfAccountDeletionEnabled', false);
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'DELETE',
          url: '/api/users/me',
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
