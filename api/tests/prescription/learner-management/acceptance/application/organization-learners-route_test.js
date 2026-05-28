import { createServer } from '../../../../../server.js';
import { IMPORT_KEY_FIELD } from '../../../../../src/prescription/learner-management/domain/constants.js';
import { getLastByOrganizationId } from '../../../../../src/prescription/learner-management/infrastructure/repositories/organization-import-repository.js';
import { PIX_ADMIN } from '../../../../../src/shared/domain/constants.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Prescription | learner management | Application | organization-learners-management', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/organizations/{organizationId}/organization-learners/filters', function () {
    it('should return 200 with filters when user is a member of the organization', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id });
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFilter({
        organizationId: organization.id,
        attributeName: 'division',
        values: ['6A', '6B'],
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/organization-learners/filters`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].type).to.equal('organization-learner-filters');
    });
  });

  describe('DELETE /api/admin/organization-learners/{id}/association', function () {
    context('When user has the role SUPER_ADMIN and organization learner can be dissociated', function () {
      it('should return an 204 status after having successfully dissociated user from organizationLearner', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });

        await databaseBuilder.commit();

        const options = {
          method: 'DELETE',
          url: `/api/admin/organization-learners/${organizationLearner.id}/association`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(204);
      });
    });
  });

  describe('DELETE /organizations/{organizationId}/organization-learners', function () {
    let options;

    it('should return a 200 status after having successfully deleted organization learners', async function () {
      // given
      const { id: firstOrganizationLearnerId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
      const secondOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId, organizationRole: 'ADMIN' });

      await databaseBuilder.commit();

      options = {
        method: 'DELETE',
        url: `/api/organizations/${organizationId}/organization-learners`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        payload: {
          listLearners: [firstOrganizationLearnerId, secondOrganizationLearnerId],
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('DELETE /admin/organizations/{organizationId}/organization-learners/{organizationLearnerId}', function () {
    let options;

    it('should return a 200 status after having successfully deleted organization learners', async function () {
      // given
      const { id: organizationLearnerId, organizationId } = databaseBuilder.factory.buildOrganizationLearner();
      const userId = databaseBuilder.factory.buildUser.withRole({ role: PIX_ADMIN.ROLES.SUPPORT }).id;

      await databaseBuilder.commit();

      options = {
        method: 'DELETE',
        url: `/api/admin/organizations/${organizationId}/organization-learners/${organizationLearnerId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /organizations/{organizationId}/import-organization-learners', function () {
    let options, connectedUser;

    beforeEach(async function () {
      connectedUser = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    it('add learners', async function () {
      // given
      const buffer = `column_firstname;column_lastname;hobby\n` + 'sasha;du bourg palette;pokemon hunter\n';
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const featureId = databaseBuilder.factory.buildFeature({ key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key }).id;
      const organizationLearnerImportFormatId = databaseBuilder.factory.buildOrganizationLearnerImportFormat({
        name: 'ONDE',
        fileType: 'csv',
        config: {
          unicityColumns: ['column_firstname'],
          acceptedEncoding: ['utf-8'],
          headers: [
            {
              name: 'column_firstname',
              config: { property: 'firstName', validate: { type: 'string' } },
              required: true,
            },
            { name: 'column_lastname', config: { property: 'lastName' }, required: true },
            { name: 'hobby', required: false },
          ],
        },
      }).id;

      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId,
        params: { organizationLearnerImportFormatId },
      });

      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: connectedUser.id,
        organizationRole: Membership.roles.ADMIN,
      });

      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: `/api/organizations/${organizationId}/import-organization-learners`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: connectedUser.id }),
        payload: buffer,
      };
      // when
      const response = await server.inject(options);

      const organizationImport = await getLastByOrganizationId(organizationId);
      // then
      expect(response.statusCode).to.equal(204);

      expect(organizationImport.status).to.equals('UPLOADED');
    });
  });

  describe('POST /api/organization-learners/reconcile', function () {
    let connectedUser;

    beforeEach(async function () {
      connectedUser = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    it('reconcile connected user given parameter', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildCampaign({ organizationId });
      const featureId = databaseBuilder.factory.buildFeature({ key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key }).id;
      const organizationLearnerImportFormatId = databaseBuilder.factory.buildOrganizationLearnerImportFormat({
        name: 'GENERIC',
        fileType: 'csv',
        config: {
          acceptedEncoding: ['utf8'],
          unicityColumns: ['unicity key'],
          headers: [
            {
              config: {
                property: 'lastName',
                validate: { type: 'string', required: true },
                reconcile: { fieldId: 'reconcileField1', name: IMPORT_KEY_FIELD.COMMON_LASTNAME, position: 1 },
              },
              name: 'Nom apprenant',
              required: true,
            },
            {
              config: {
                property: 'firstName',
                validate: { type: 'string', required: true },
                reconcile: { fieldId: 'reconcileField2', name: IMPORT_KEY_FIELD.COMMON_FIRSTNAME, position: 2 },
              },
              name: 'Prénom apprenant',
              required: true,
            },
            { config: {}, name: 'unicity key', required: true },
            { config: { validate: { type: 'string', required: true } }, name: 'catégorie', required: true },
            {
              config: { validate: { type: 'date', format: 'YYYY-MM-DD', required: true } },
              name: 'Date de naissance',
              required: true,
            },
          ],
        },
      }).id;

      await databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
        firstName: 'Edgar',
        lastName: 'Aheurfix',
        attributes: {
          'date de naissance': '2020-01-01',
          category: 'manger',
        },
        userId: null,
        organizationId,
      });

      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId,
        params: { organizationLearnerImportFormatId },
      });

      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: `/api/organization-learners/reconcile`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: connectedUser.id }),
        payload: {
          data: {
            attributes: {
              'organization-id': organizationId,
              'reconciliation-infos': {
                reconcileField1: 'Aheurfix',
                reconcileField2: 'Edgar',
              },
            },
            type: 'organization-learner',
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('PATCH /api/organizations/{organizationId}/organization-learners/{organizationLearnerId}', function () {
    let organization;
    let organizationLearner;
    let user;
    let headers;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser();
      headers = generateAuthenticatedUserRequestHeaders({ userId: user.id });
      await databaseBuilder.commit();
    });

    context('Success cases', function () {
      it('should return 204 and update organization learner name', async function () {
        // given
        organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: false });
        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'OldFirstName',
          lastName: 'OldLastName',
        });
        databaseBuilder.factory.buildMembership({
          organizationId: organization.id,
          userId: user.id,
          organizationRole: Membership.roles.ADMIN,
        });
        await databaseBuilder.commit();

        const options = {
          method: 'PATCH',
          url: `/api/organizations/${organization.id}/organization-learners/${organizationLearner.id}`,
          headers,
          payload: {
            firstName: 'NewFirstName',
            lastName: 'NewLastName',
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('Error cases', function () {
      context('when organization is managing students', function () {
        it('should return 403 - Forbidden', async function () {
          // given
          organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
          organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            firstName: 'OldFirstName',
            lastName: 'OldLastName',
          });
          databaseBuilder.factory.buildMembership({
            organizationId: organization.id,
            userId: user.id,
            organizationRole: Membership.roles.ADMIN,
          });
          await databaseBuilder.commit();

          const options = {
            method: 'PATCH',
            url: `/api/organizations/${organization.id}/organization-learners/${organizationLearner.id}`,
            headers,
            payload: {
              firstName: 'NewFirstName',
              lastName: 'NewLastName',
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when user is not admin of organization', function () {
        it('should return 403 - Forbidden', async function () {
          // given==
          organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: false });
          organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            firstName: 'OldFirstName',
            lastName: 'OldLastName',
          });
          databaseBuilder.factory.buildMembership({
            organizationId: organization.id,
            userId: user.id,
            organizationRole: Membership.roles.MEMBER, // Not admin
          });
          await databaseBuilder.commit();

          const options = {
            method: 'PATCH',
            url: `/api/organizations/${organization.id}/organization-learners/${organizationLearner.id}`,
            headers,
            payload: {
              firstName: 'NewFirstName',
              lastName: 'NewLastName',
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when organization has LEARNER_IMPORT feature', function () {
        it('should return 403 - Forbidden', async function () {
          // given
          organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: false });
          organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            firstName: 'OldFirstName',
            lastName: 'OldLastName',
          });
          databaseBuilder.factory.buildMembership({
            organizationId: organization.id,
            userId: user.id,
            organizationRole: Membership.roles.ADMIN,
          });

          // Add LEARNER_IMPORT feature to organization
          const featureId = databaseBuilder.factory.buildFeature({ key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key }).id;
          databaseBuilder.factory.buildOrganizationFeature({
            organizationId: organization.id,
            featureId,
          });

          await databaseBuilder.commit();

          const options = {
            method: 'PATCH',
            url: `/api/organizations/${organization.id}/organization-learners/${organizationLearner.id}`,
            headers,
            payload: {
              firstName: 'NewFirstName',
              lastName: 'NewLastName',
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when organization learner does not belong to the organization', function () {
        it('should return 404 - Not Found', async function () {
          // given
          organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: false });
          const otherOrganization = databaseBuilder.factory.buildOrganization({ isManagingStudents: false });

          // Organization learner belongs to a different organization
          organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: otherOrganization.id,
            firstName: 'OldFirstName',
            lastName: 'OldLastName',
          });

          databaseBuilder.factory.buildMembership({
            organizationId: organization.id,
            userId: user.id,
            organizationRole: Membership.roles.ADMIN,
          });
          await databaseBuilder.commit();

          const options = {
            method: 'PATCH',
            url: `/api/organizations/${organization.id}/organization-learners/${organizationLearner.id}`,
            headers,
            payload: {
              firstName: 'NewFirstName',
              lastName: 'NewLastName',
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when user is not authenticated', function () {
        it('should return 401 - Unauthorized', async function () {
          // given
          organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: false });
          organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            firstName: 'OldFirstName',
            lastName: 'OldLastName',
          });
          await databaseBuilder.commit();

          const options = {
            method: 'PATCH',
            url: `/api/organizations/${organization.id}/organization-learners/${organizationLearner.id}`,
            headers: {}, // No authentication headers
            payload: {
              firstName: 'NewFirstName',
              lastName: 'NewLastName',
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });
      });
    });
  });

  describe('POST /api/sco-organization-learners/association/auto', function () {
    const nationalStudentId = '12345678AZ';
    let organization;
    let options;
    let user;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/sco-organization-learners/association/auto',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: null,
        nationalStudentId,
      });

      await databaseBuilder.commit();
    });

    it('should return an 200 status after having successfully associated user to organizationLearner', async function () {
      // given
      databaseBuilder.factory.buildOrganizationLearner({ userId: user.id, nationalStudentId });
      await databaseBuilder.commit();

      options.headers = generateAuthenticatedUserRequestHeaders({ userId: user.id });
      options.payload.data = {
        attributes: {
          'organization-id': organization.id,
        },
        type: 'sco-organization-learners',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when user is not authenticated', function () {
      it('should respond with a 401 - unauthorized access', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
