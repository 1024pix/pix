import { createServer } from '../../../../server.js';
import { ATTESTATIONS } from '../../../../src/profile/domain/constants.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Quest | Acceptance | Application | Combined course blueprint Route ', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/combined-course-blueprints', function () {
    context('when user is admin ', function () {
      it('should return the list of combined course blueprints', async function () {
        // given
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        databaseBuilder.factory.buildCombinedCourseBlueprint();
        databaseBuilder.factory.buildCombinedCourseBlueprint();
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/admin/combined-course-blueprints`,
          headers: generateAuthenticatedUserRequestHeaders({
            userId: superAdmin.id,
          }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(2);
      });
    });
  });

  describe('POST /api/admin/combined-course-blueprints', function () {
    context('when user is admin ', function () {
      it('should create a combined course blueprint', async function () {
        // given
        const attestation = databaseBuilder.factory.buildAttestation({
          key: ATTESTATIONS.SIXTH_GRADE,
        });
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        await databaseBuilder.commit();

        const payload = {
          data: {
            type: 'combined-course-blueprints',
            attributes: {
              name: 'Mon parcours combiné',
              'internal-name': 'Mon schéma de parcours combiné',
              description: 'La description combinix',
              illustration: 'illustration.svg',
              'reward-id': attestation.id,
              'reward-type': 'ATTESTATION',
              content: [
                {
                  type: 'module',
                  value: 'e67ec5d0',
                  shortId: 'short-e67ec5d0',
                },
              ],
            },
          },
        };
        const options = {
          method: 'POST',
          url: `/api/admin/combined-course-blueprints`,
          headers: generateAuthenticatedUserRequestHeaders({
            userId: superAdmin.id,
          }),
          payload,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.attributes.name).to.equal(payload.data.attributes.name);
      });
    });
  });

  describe('GET /api/admin/combined-course-blueprints/:blueprintId', function () {
    context('when user is admin ', function () {
      it('should return combined course blueprint for given id', async function () {
        // given
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        const combinedCourseBlueprint = databaseBuilder.factory.buildCombinedCourseBlueprint();
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/admin/combined-course-blueprints/${combinedCourseBlueprint.id}`,
          headers: generateAuthenticatedUserRequestHeaders({
            userId: superAdmin.id,
          }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.id).to.equal(combinedCourseBlueprint.id.toString());
        expect(response.result.data.type).to.equal('combined-course-blueprints');
      });
    });
  });

  describe('DELETE /api/admin/combined-course-blueprints/:blueprintId/organizations/:organizationId', function () {
    context('when user is admin ', function () {
      it('should detach a combined course blueprint from organization', async function () {
        // given
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        const { combinedCourseBlueprintId, organizationId } =
          databaseBuilder.factory.buildCombinedCourseBlueprintShare();
        await databaseBuilder.commit();

        const options = {
          method: 'DELETE',
          url: `/api/admin/combined-course-blueprints/${combinedCourseBlueprintId}/organizations/${organizationId}`,
          headers: generateAuthenticatedUserRequestHeaders({
            userId: superAdmin.id,
          }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });

  describe('POST /api/admin/combined-course-blueprints/:blueprintId/organizations', function () {
    context('when user is admin ', function () {
      it('should attach a combined course blueprint to one or several organizations', async function () {
        // given
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        const combinedCourseBlueprintId = databaseBuilder.factory.buildCombinedCourseBlueprint().id;
        const alreadyAttachedOrganization = databaseBuilder.factory.buildOrganization();

        databaseBuilder.factory.buildCombinedCourseBlueprintShare({
          combinedCourseBlueprintId,
          organizationId: alreadyAttachedOrganization.id,
        });

        const organizationNotYetAttached = databaseBuilder.factory.buildOrganization();
        const otherOrganizationNotYetAttached = databaseBuilder.factory.buildOrganization();

        await databaseBuilder.commit();

        const payload = {
          'organization-ids': [
            alreadyAttachedOrganization.id,
            organizationNotYetAttached.id,
            otherOrganizationNotYetAttached.id,
          ],
        };

        const options = {
          method: 'POST',
          url: `/api/admin/combined-course-blueprints/${combinedCourseBlueprintId}/organizations`,
          headers: generateAuthenticatedUserRequestHeaders({
            userId: superAdmin.id,
          }),
          payload,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.attributes).to.deep.equal({
          'attached-ids': [organizationNotYetAttached.id, otherOrganizationNotYetAttached.id],
          'duplicated-ids': [alreadyAttachedOrganization.id],
        });
      });
    });
  });

  describe('GET /api/organizations/:id/combined-course-blueprints', function () {
    context('when user is authenticated', function () {
      let user;
      let organization;

      beforeEach(async function () {
        user = databaseBuilder.factory.buildUser({});
        organization = databaseBuilder.factory.buildOrganization({});
        databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: organization.id,
        });

        await databaseBuilder.commit();
      });

      it('should return 200', async function () {
        const options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/combined-course-blueprints`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('PATCH /api/combined-course-blueprints/:id', function () {
    context('when user is admin', function () {
      let superAdmin;
      let combinedCourseBlueprintId;

      beforeEach(async function () {
        combinedCourseBlueprintId = databaseBuilder.factory.buildCombinedCourseBlueprint().id;
        superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();

        await databaseBuilder.commit();
      });

      it('should return 204', async function () {
        const payload = {
          data: {
            type: 'combined-course-blueprints',
            attributes: {
              name: 'Mon parcours combiné',
              'internal-name': 'Mon schéma de parcours combiné',
              description: 'La description combinix',
              illustration: 'illustration.svg',
            },
          },
        };
        const options = {
          method: 'PATCH',
          url: `/api/admin/combined-course-blueprints/${combinedCourseBlueprintId}`,
          headers: generateAuthenticatedUserRequestHeaders({
            userId: superAdmin.id,
          }),
          payload,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });

  describe('GET /api/organizations/{organizationId}/combined-course-blueprints/{blueprintId}', function () {
    let user;
    let organization;
    let combinedCourseBlueprint;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser({});
      organization = databaseBuilder.factory.buildOrganization({});
      databaseBuilder.factory.buildMembership({
        userId: user.id,
        organizationId: organization.id,
      });
      combinedCourseBlueprint = databaseBuilder.factory.buildCombinedCourseBlueprint();
      databaseBuilder.factory.buildCombinedCourseBlueprintShare({
        combinedCourseBlueprintId: combinedCourseBlueprint.id,
        organizationId: organization.id,
      });

      await databaseBuilder.commit();
    });

    it('should return 200', async function () {
      const options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/combined-course-blueprints/${combinedCourseBlueprint.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
