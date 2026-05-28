import FormData from 'form-data';

import { createServer } from '../../../../server.js';
import { PIX_ADMIN } from '../../../../src/shared/domain/constants.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/domain/constants.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { AttestationTemplateFixture } from '../../../tooling/fixtures/index.js';
import { mockAttestationStorageUpload } from '../../../tooling/mocks/attestation-storage.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Quest | Acceptance | Application | Attestation Route ', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/attestations', function () {
    context('when user has one of the authorized roles', function () {
      let userId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser.withRole({ role: PIX_ADMIN.ROLES.SUPER_ADMIN }).id;
        await databaseBuilder.commit();
      });
      context('when all parameters are valid', function () {
        it('creates attestation', async function () {
          const templateKey = 'key';
          const templateName = 'name';
          const label = 'label';

          const formData = new FormData();
          formData.append('templateKey', templateKey);
          formData.append('templateName', templateName);
          const templateFile = await AttestationTemplateFixture.getFile();
          formData.append('templateFile', templateFile, {
            filename: 'attestation-template.pdf',
            contentType: 'application/pdf',
          });
          formData.append('label', label);
          mockAttestationStorageUpload({ attestation: { templateName } });
          const options = {
            method: 'POST',
            url: '/api/admin/attestations',
            headers: {
              ...formData.getHeaders(),
              ...generateAuthenticatedUserRequestHeaders({ userId }),
            },
            payload: formData.getBuffer(),
          };

          // when
          const response = await server.inject(options);

          // then
          const createdAttestation = await knex('attestations').where('key', templateKey).first();

          expect(response.statusCode).to.equal(204);

          expect(createdAttestation.templateName).to.equal('name');
        });
      });

      context('when file is not a pdf', function () {
        it('should return a 400 error code', async function () {
          // given
          const formData = new FormData();
          formData.append('templateKey', 'key');
          formData.append('templateName', 'name');

          formData.append('templateFile', Buffer.alloc(0), { filename: 'testFile_temp.jpeg' });

          const options = {
            method: 'POST',
            url: '/api/admin/attestations',
            headers: {
              ...formData.getHeaders(),
              ...generateAuthenticatedUserRequestHeaders({ userId }),
            },
            payload: formData.getBuffer(),
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('GET /api/organizations/${organizationId}/attestations', function () {
    context('when user has one of the authorized roles', function () {
      let user;
      let organization;

      beforeEach(async function () {
        user = databaseBuilder.factory.buildUser();
        organization = databaseBuilder.factory.buildOrganization({
          credit: 5,
          isManagingStudents: true,
        });
        databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id });
        databaseBuilder.factory.buildUserOrgaSettings({
          currentOrganizationId: organization.id,
          userId: user.id,
        });

        databaseBuilder.factory.buildAttestation({ key: 'SIXTH_GRADE', label: '6ème' });
        const attestationFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT);
        databaseBuilder.factory.buildOrganizationFeature({
          organizationId: organization.id,
          featureId: attestationFeature.id,
          params: JSON.stringify(['SIXTH_GRADE']),
        });

        await databaseBuilder.commit();
      });

      it('retrieves all attestations from an organization', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/attestations`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
