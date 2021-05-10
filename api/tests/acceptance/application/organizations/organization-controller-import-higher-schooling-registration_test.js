const { expect, knex, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const Membership = require('../../../../lib/domain/models/Membership');
const HigherSchoolingRegistrationColumns = require('../../../../lib/infrastructure/serializers/csv/higher-schooling-registration-columns');

const { getI18n } = require('../../../../tests/tooling/i18n/i18n');
const createServer = require('../../../../server');

const i18n = getI18n();
const higherSchoolingRegistrationColumns = new HigherSchoolingRegistrationColumns(i18n).columns.map((column) => column.label).join(';');

let server;

describe('Acceptance | Application | organization-controller-import-higher-schooling-registrations', () => {

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(() => {
    return knex('schooling-registrations').delete();
  });

  describe('POST organizations/:id/schooling-registrations/import-csv', () => {
    let connectedUser;
    beforeEach(async () => {
      connectedUser = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    context('when the user is an admin for an organization which managing student', () => {
      it('create schooling-registrations for the given organization', async () => {
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
        databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: connectedUser.id, organizationRole: Membership.roles.ADMIN });
        await databaseBuilder.commit();
        const buffer =
          `${higherSchoolingRegistrationColumns}\n` +
          'Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1990;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend\n' +
          'O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;Autre;';

        const options = {
          method: 'POST',
          url: `/api/organizations/${organization.id}/schooling-registrations/import-csv`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
          },
          payload: buffer,
        };

        const response = await server.inject(options);
        const registrations = await knex('schooling-registrations').where({ organizationId: organization.id });
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: {
            id: String(organization.id),
            type: 'higher-schooling-registration-warnings',
            attributes: {
              warnings: [
                { code: 'unknown', field: 'study-scheme', studentNumber: '12346', value: 'hello darkness my old friend' },
                { code: 'unknown', field: 'diploma', studentNumber: '12346', value: 'Master' },
                { code: 'unknown', field: 'diploma', studentNumber: '789', value: 'DUT' },
              ],
            },
          },
        });
        expect(registrations).to.have.lengthOf(2);
      });

      it('fails when the file payload is too large', async () => {
        const buffer = Buffer.alloc(1048576 * 11, 'B'); // > 10 Mo buffer

        const options = {
          method: 'POST',
          url: '/api/organizations/123/schooling-registrations/import-csv',
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

    context('when the user is not an admin for the organization which managing student', () => {
      it('create schooling-registrations for the given organization', async () => {
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true });
        databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: connectedUser.id, organizationRole: Membership.roles.MEMBER });
        await databaseBuilder.commit();
        const buffer = higherSchoolingRegistrationColumns;

        const options = {
          method: 'POST',
          url: `/api/organizations/${organization.id}/schooling-registrations/import-csv`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
          },
          payload: buffer,
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(403);
      });
    });

    context('when the user is an admin for the organization which managing student but the organization is not SUP', () => {
      it('create schooling-registrations for the given organization', async () => {
        const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
        databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: connectedUser.id, organizationRole: Membership.roles.ADMIN });
        await databaseBuilder.commit();
        const buffer = higherSchoolingRegistrationColumns;

        const options = {
          method: 'POST',
          url: `/api/organizations/${organization.id}/schooling-registrations/import-csv`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
          },
          payload: buffer,
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
