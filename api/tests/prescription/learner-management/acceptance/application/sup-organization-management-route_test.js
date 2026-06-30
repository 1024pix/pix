import { createServer } from '../../../../../server.js';
import { UserAccessToken } from '../../../../../src/identity-access-management/domain/models/UserAccessToken.js';
import { SupHeader } from '../../../../../src/prescription/learner-management/infrastructure/serializers/csv/headers/sup-header.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

const i18n = getI18n();
const supOrganizationLearnerImportHeader = new SupHeader(i18n).columns.map((column) => column.name).join(';');

let server;

describe('Acceptance | Application | organization-controller-sup-organization-learners', function () {
  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/sup-organization-learners/association', function () {
    let organization;
    let campaign;
    let options;
    let user;

    beforeEach(async function () {
      // given
      options = {
        method: 'POST',
        url: '/api/sup-organization-learners/association',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Jean',
        lastName: 'Michel',
        birthdate: new Date('2010-01-01'),
        studentNumber: '12345',
        organizationId: organization.id,
        userId: null,
      });

      await databaseBuilder.commit();
    });

    it('should return an 204 status after updating higher organization learner', async function () {
      // given
      options.headers = generateAuthenticatedUserRequestHeaders({ userId: user.id });
      options.payload.data = {
        attributes: {
          'student-number': '12345',
          'first-name': 'Jean',
          'last-name': 'Michel',
          birthdate: '2010-01-01',
          'campaign-code': campaign.code,
        },
        type: 'sup-organization-learners',
      };

      // when
      const response = await server.inject(options);
      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('POST organizations/{organizationId/sup-organization-learners/import-csv', function () {
    let connectedUser;

    beforeEach(async function () {
      connectedUser = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    context('when the user is an admin for an organization which managing student', function () {
      it('create organization-learners for the given organization', async function () {
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
        databaseBuilder.factory.buildMembership({
          organizationId: organization.id,
          userId: connectedUser.id,
          organizationRole: Membership.roles.ADMIN,
        });
        await databaseBuilder.commit();
        const buffer =
          `${supOrganizationLearnerImportHeader}\n` +
          'Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1990;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend\n' +
          'O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;Autre;';

        const options = {
          method: 'POST',
          url: `/api/organizations/${organization.id}/sup-organization-learners/import-csv`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: connectedUser.id }),
          payload: buffer,
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(204);
      });

      it('fails when the file payload is too large', async function () {
        const buffer = Buffer.alloc(1048576 * 11, 'B'); // > 10 Mo buffer

        const options = {
          method: 'POST',
          url: '/api/organizations/123/sup-organization-learners/import-csv',
          headers: generateAuthenticatedUserRequestHeaders({ userId: connectedUser.id }),
          payload: buffer,
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(413);
        expect(response.result.errors[0].code).to.equal('PAYLOAD_TOO_LARGE');
        expect(response.result.errors[0].meta.maxSize).to.equal('10');
      });
    });

    context('when the user is not an admin for the organization which managing student', function () {
      it('create organization-learner for the given organization', async function () {
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
        databaseBuilder.factory.buildMembership({
          organizationId: organization.id,
          userId: connectedUser.id,
          organizationRole: Membership.roles.MEMBER,
        });
        await databaseBuilder.commit();
        const buffer = supOrganizationLearnerImportHeader;

        const options = {
          method: 'POST',
          url: `/api/organizations/${organization.id}/sup-organization-learners/import-csv`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: connectedUser.id }),
          payload: buffer,
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(403);
      });
    });

    context(
      'when the user is an admin for the organization which managing student but the organization is not SUP',
      function () {
        it('create organization-learners for the given organization', async function () {
          const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
          databaseBuilder.factory.buildMembership({
            organizationId: organization.id,
            userId: connectedUser.id,
            organizationRole: Membership.roles.ADMIN,
          });
          await databaseBuilder.commit();
          const buffer = supOrganizationLearnerImportHeader;

          const options = {
            method: 'POST',
            url: `/api/organizations/${organization.id}/sup-organization-learners/import-csv`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: connectedUser.id }),
            payload: buffer,
          };

          const response = await server.inject(options);

          expect(response.statusCode).to.equal(403);
        });
      },
    );
  });

  describe('POST organizations/{organizationId}/sup-organization-learners/replace-csv', function () {
    let connectedUser;

    beforeEach(async function () {
      connectedUser = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    context('when the user is an admin for an organization which managing student', function () {
      it('replaces the organizationLearners for the given organization', async function () {
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
        databaseBuilder.factory.buildMembership({
          organizationId: organization.id,
          userId: connectedUser.id,
          organizationRole: Membership.roles.ADMIN,
        });
        databaseBuilder.factory.buildOrganizationLearner({
          id: 1,
          organizationId: organization.id,
          isDisabled: false,
        });
        await databaseBuilder.commit();
        const buffer =
          `${supOrganizationLearnerImportHeader}\n` +
          'Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1990;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend\n';
        const options = {
          method: 'POST',
          url: `/api/organizations/${organization.id}/sup-organization-learners/replace-csv`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: connectedUser.id }),
          payload: buffer,
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(204);
      });

      it('fails when the file payload is too large', async function () {
        const buffer = Buffer.alloc(1048576 * 11, 'B'); // > 10 Mo buffer

        const options = {
          method: 'POST',
          url: '/api/organizations/123/sup-organization-learners/replace-csv',
          headers: generateAuthenticatedUserRequestHeaders({ userId: connectedUser.id }),
          payload: buffer,
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(413);
        expect(response.result.errors[0].code).to.equal('PAYLOAD_TOO_LARGE');
        expect(response.result.errors[0].meta.maxSize).to.equal('10');
      });
    });
  });

  describe('GET /api/organizations/{organizationId}/organization-learners/csv-template', function () {
    let userId, organization, accessToken;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      accessToken = UserAccessToken.generateUserToken({
        userId,
        source: 'pix',
        audience: 'https://orga.pix.org',
      }).accessToken;
    });

    context("when it's a SUP organization", function () {
      beforeEach(async function () {
        organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
        databaseBuilder.factory.buildMembership({
          userId,
          organizationId: organization.id,
          organizationRole: Membership.roles.ADMIN,
        });
        await databaseBuilder.commit();
      });

      it('should return csv file with statusCode 200', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/organization-learners/csv-template?accessToken=${accessToken}`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200, response.payload);
      });
    });

    context("when it's not a valid organization", function () {
      beforeEach(async function () {
        organization = databaseBuilder.factory.buildOrganization({ type: 'PRO' });
        databaseBuilder.factory.buildMembership({
          userId,
          organizationId: organization.id,
          organizationRole: Membership.roles.ADMIN,
        });
        await databaseBuilder.commit();
      });

      it('should return an error with statusCode 403', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}/organization-learners/csv-template?accessToken=${accessToken}`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403, response.payload);
      });
    });
  });

  describe('PATCH /api/organizations/{organizationId}/sup-organization-learners/{organizationLearnerId}', function () {
    let organizationId;
    const studentNumber = '54321';
    let organizationLearnerId;
    let headers;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true, type: 'SUP' }).id;

      const user = databaseBuilder.factory.buildUser();
      headers = generateAuthenticatedUserRequestHeaders({ userId: user.id });
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ organizationId }).id;
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: user.id,
        organizationRole: Membership.roles.ADMIN,
      });
      await databaseBuilder.commit();
    });

    context('Success cases', function () {
      it('should return an HTTP response with status code 204', async function () {
        const options = {
          method: 'PATCH',
          url: `/api/organizations/${organizationId}/sup-organization-learners/${organizationLearnerId}`,
          headers,
          payload: {
            data: {
              attributes: {
                'student-number': studentNumber,
              },
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
});
