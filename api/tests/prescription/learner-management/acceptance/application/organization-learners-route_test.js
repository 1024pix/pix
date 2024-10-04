import { IMPORT_KEY_FIELD } from '../../../../../src/prescription/learner-management/domain/constants.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../../test-helper.js';

describe('Acceptance | Prescription | learner management | Application | organization-learners-management', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('DELETE /api/admin/organization-learners/{id}/association', function () {
    context('When user has the role SUPER_ADMIN and organization learner can be dissociated', function () {
      it('should return an 204 status after having successfully dissociated user from organizationLearner', async function () {
        const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
        const superAdmin = await insertUserWithRoleSuperAdmin();
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });

        await databaseBuilder.commit();

        const options = {
          method: 'DELETE',
          url: `/api/admin/organization-learners/${organizationLearner.id}/association`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
          },
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(204);
      });
    });
  });

  describe('DELETE /organizations/{id}/organization-learners', function () {
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
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
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
        headers: {
          authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
        },
        payload: buffer,
      };
      // when
      const response = await server.inject(options);

      const organizationLearners = await knex('organization-learners').where({ organizationId });
      // then
      expect(response.statusCode).to.equal(204);

      expect(organizationLearners).lengthOf(1);
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
      const campaign = databaseBuilder.factory.buildCampaign({ code: 'RECONCILIATION', organizationId });
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
          catégorie: 'manger',
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
        headers: {
          authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
        },
        payload: {
          data: {
            attributes: {
              'campaign-code': campaign.code,
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

  describe('POST /api/sco-organization-learners/association/auto', function () {
    const nationalStudentId = '12345678AZ';
    let organization;
    let campaign;
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
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
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

      options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
      options.payload.data = {
        attributes: {
          'campaign-code': campaign.code,
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
