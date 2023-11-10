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

describe('Acceptance | Application | organization-controller-replace-sup-organization-learners', function () {
  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST organizations/:id/sup-organization-learners/replace-csv', function () {
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
          headers: {
            authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
          },
          payload: buffer,
        };

        const response = await server.inject(options);
        const organizationLearners = await knex('organization-learners').where({ organizationId: organization.id });
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
              ],
            },
          },
        });
        expect(organizationLearners).to.have.lengthOf(2);
      });

      it('fails when the file payload is too large', async function () {
        const buffer = Buffer.alloc(1048576 * 11, 'B'); // > 10 Mo buffer

        const options = {
          method: 'POST',
          url: '/api/organizations/123/sup-organization-learners/replace-csv',
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
  });
});
