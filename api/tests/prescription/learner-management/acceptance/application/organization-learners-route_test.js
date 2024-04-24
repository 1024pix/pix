import { Membership } from '../../../../../lib/domain/models/Membership.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
} from '../../../../test-helper.js';

describe('Acceptance | Application | organization-learners', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
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
});
