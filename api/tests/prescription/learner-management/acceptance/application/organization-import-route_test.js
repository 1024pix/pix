import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { CsvImportError } from '../../../../../src/shared/domain/errors.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | Application | organization-import', function () {
  let server;

  before(async function () {
    server = await createServer();
  });

  describe('GET /organizations/{id}/import-information', function () {
    let options, connectedUser;

    beforeEach(async function () {
      connectedUser = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    it('should return the last organization import status for a sup organization with an error', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });

      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: connectedUser.id,
        organizationRole: Membership.roles.ADMIN,
      });

      databaseBuilder.factory.buildOrganizationImport({
        organizationId: organization.id,
        createdBy: connectedUser.id,
        // we destructure error to mimic getOwnPropertyNames / reducde
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#description
        errors: JSON.stringify([{ ...new CsvImportError('header_error', { line: 3 }) }]),
      });
      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/import-information`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
        },
      };
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return the last organization import status for a sco organization with no error', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });

      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: connectedUser.id,
        organizationRole: Membership.roles.ADMIN,
      });

      databaseBuilder.factory.buildOrganizationImport({
        organizationId: organization.id,
        createdBy: connectedUser.id,
        errors: JSON.stringify([]),
      });

      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/import-information`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
        },
      };
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return the last organization import status for an organization with learnerImport feature with no error', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
      const featureId = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key,
      }).id;
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId: organization.id,
        featureId,
      });
      databaseBuilder.factory.buildMembership({
        organizationId: organization.id,
        userId: connectedUser.id,
        organizationRole: Membership.roles.ADMIN,
      });

      databaseBuilder.factory.buildOrganizationImport({
        organizationId: organization.id,
        createdBy: connectedUser.id,
        errors: JSON.stringify([]),
      });

      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/import-information`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
        },
      };
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/admin/import-organization-learners-format', function () {
    let options, connectedUser;

    beforeEach(async function () {
      connectedUser = databaseBuilder.factory.buildUser.withRole({ role: PIX_ADMIN.ROLES.SUPER_ADMIN });
      await databaseBuilder.commit();
    });

    it('should upload file with no error', async function () {
      // given
      const buffer = '[{"name":"GENERIC","fileType":"csv","config":{"awesome_config": "pouet"}}]';
      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: `/api/admin/import-organization-learners-format`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
        },
        payload: buffer,
      };
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
