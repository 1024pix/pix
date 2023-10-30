import { expect, knex, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../../test-helper.js';
import { Membership } from '../../../../../lib/domain/models/Membership.js';
import { SupOrganizationLearnerImportHeader } from '../../../../../src/prescription/learner-management/infrastructure/serializers/csv/sup-organization-learner-import-header.js';
import { getI18n } from '../../../../tooling/i18n/i18n.js';
import { createServer } from '../../../../../server.js';

const i18n = getI18n();
const supOrganizationLearnerImportHeader = new SupOrganizationLearnerImportHeader(i18n).columns
  .map((column) => column.name)
  .join(';');

let server;

describe('Acceptance | Application | organization-controller-import-sup-organization-learners', function () {
  beforeEach(async function () {
    server = await createServer();
  });

  afterEach(function () {
    return knex('organization-learners').delete();
  });

  describe('POST organizations/:id/sup-organization-learners/import-csv', function () {
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
          headers: {
            authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
          },
          payload: buffer,
        };

        const response = await server.inject(options);
        const learners = await knex('organization-learners').where({ organizationId: organization.id });
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: {
            id: String(organization.id),
            type: 'sup-organization-learner-warnings',
            attributes: {
              warnings: [
                {
                  code: 'unknown',
                  field: 'study-scheme',
                  studentNumber: '12346',
                  value: 'hello darkness my old friend',
                },
                { code: 'unknown', field: 'diploma', studentNumber: '12346', value: 'Master' },
                { code: 'unknown', field: 'diploma', studentNumber: '789', value: 'DUT' },
              ],
            },
          },
        });
        expect(learners).to.have.lengthOf(2);
      });

      it('fails when the file payload is too large', async function () {
        const buffer = Buffer.alloc(1048576 * 11, 'B'); // > 10 Mo buffer

        const options = {
          method: 'POST',
          url: '/api/organizations/123/sup-organization-learners/import-csv',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
          },
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
          headers: {
            authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
          },
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
            headers: {
              authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
            },
            payload: buffer,
          };

          const response = await server.inject(options);

          expect(response.statusCode).to.equal(403);
        });
      },
    );
  });
});
