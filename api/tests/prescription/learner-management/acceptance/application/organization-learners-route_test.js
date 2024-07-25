import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
} from '../../../../test-helper.js';

describe('Acceptance | Prescription | learner management | Application | organization-learners-management', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
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
          validationRules: { formats: [{ name: 'column_lastname', type: 'string' }] },
          headers: [
            { name: 'column_firstname', property: 'firstName', required: true },
            { name: 'column_lastname', property: 'lastName', required: true },
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
          reconciliationMappingColumns: [
            { key: 'reconcileField1', columnName: 'Nom apprenant' },
            { key: 'reconcileField2', columnName: 'catégorie' },
          ],
          validationRules: {
            formats: [
              { name: 'Nom apprenant', type: 'string', required: true },
              { name: 'Prénom apprenant', type: 'string', required: true },
              { name: 'unicity key', type: 'string', required: true },
              { name: 'catégorie', type: 'string', required: true },
              { name: 'Date de naissance', type: 'date', format: 'YYYY-MM-DD', required: true },
            ],
          },
          headers: [
            { name: 'Nom apprenant', property: 'lastName', required: true },
            { name: 'Prénom apprenant', property: 'firstName', required: true },
            { name: 'unicity key', required: true },
            { name: 'catégorie', required: true },
            { name: 'Date de naissance', required: true },
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
                reconcileField2: 'manger',
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
});
