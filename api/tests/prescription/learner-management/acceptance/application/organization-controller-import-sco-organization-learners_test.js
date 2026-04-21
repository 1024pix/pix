import { EventEmitter } from 'node:events';

import iconv from 'iconv-lite';

import { OrganizationLearnerImportHeader } from '../../../../../src/prescription/learner-management/infrastructure/serializers/csv/organization-learner-import-header.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

EventEmitter.defaultMaxListeners = 60;

const i18n = getI18n();

const organizationLearnerCsvColumns = new OrganizationLearnerImportHeader(i18n).columns
  .map((column) => column.name)
  .join(';');

describe('Acceptance | Application | organization-controller-import-sco-organization-learners', function () {
  describe('POST /api/organizations/{id}/sco-organization-learners/import-siecle', function () {
    const externalId = 'UAI123ABC';
    let organizationId;
    let options;

    beforeEach(async function () {
      const connectedUser = databaseBuilder.factory.buildUser();
      organizationId = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        isManagingStudents: true,
        externalId,
      }).id;
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: connectedUser.id,
        organizationRole: Membership.roles.ADMIN,
      });
      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: `/api/organizations/${organizationId}/sco-organization-learners/import-siecle`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: connectedUser.id }),
      };
    });

    context('When a XML SIECLE file is loaded', function () {
      context('when file is too large', function () {
        beforeEach(function () {
          // given
          options.payload = Buffer.alloc(1048576 * 21, 'B'); // > 20 Mo buffer
        });

        it('should return a 413 - Payload too large', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(413);
          expect(response.result.errors[0].code).to.equal('PAYLOAD_TOO_LARGE');
          expect(response.result.errors[0].meta.maxSize).to.equal('20');
        });
      });
    });

    context('When a CSV SIECLE file is loaded', function () {
      context('SCO : when no organization learner has been imported yet, and the file is well formatted', function () {
        beforeEach(function () {
          const input = `${organizationLearnerCsvColumns}
          123F;Beatrix;The;Bride;Kiddo;Black Mamba;Féminin;01/01/1970;97422;;200;99100;ST;MEF1;Division 1;
          456F;O-Ren;;;Ishii;Cottonmouth;Féminin;01/01/1980;;Shangai;99;99132;ST;MEF1;Division 2;
          `;
          const buffer = iconv.encode(input, 'UTF-8');

          options.url = `/api/organizations/${organizationId}/sco-organization-learners/import-siecle?format=csv`;
          options.payload = buffer;
        });

        it('should respond with a 204 - no content', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });

    context('Resource access management', function () {
      beforeEach(function () {
        const buffer = iconv.encode(
          '<?xml version="1.0" encoding="ISO-8859-15"?>' +
            '<BEE_ELEVES VERSION="2.1">' +
            '<PARAMETRES>' +
            '<UAJ>UAI123ABC</UAJ>' +
            '</PARAMETRES>' +
            '</BEE_ELEVES>',
          'ISO-8859-15',
        );
        options.payload = buffer;
      });

      context('when user is not authenticated', function () {
        beforeEach(function () {
          // given
          options.headers.authorization = 'invalid.access.token';
        });

        it('should respond with a 401 - unauthorized access', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });
      });

      context('when user user does not belong to Organization', function () {
        beforeEach(async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.withMembership().id;
          await databaseBuilder.commit();

          options.headers = generateAuthenticatedUserRequestHeaders({ userId });
        });

        it('should respond with a 403 - Forbidden access', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when Organization does not manage organizationLearners', function () {
        beforeEach(async function () {
          // given
          const organizationId = databaseBuilder.factory.buildOrganization({
            type: 'SCO',
            isManagingStudents: false,
          }).id;
          const userId = databaseBuilder.factory.buildUser.withMembership({
            organizationId,
            organizationRole: Membership.roles.ADMIN,
          }).id;
          await databaseBuilder.commit();

          options.headers = generateAuthenticatedUserRequestHeaders({ userId });
          options.url = `/api/organizations/${organizationId}/sco-organization-learners/import-siecle`;
        });

        it('should respond with a 403 - Forbidden access', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when Organization is not a SCO organization', function () {
        beforeEach(async function () {
          // given
          const organizationId = databaseBuilder.factory.buildOrganization({
            type: 'SUP',
            isManagingStudents: true,
          }).id;
          const userId = databaseBuilder.factory.buildUser.withMembership({
            organizationId,
            organizationRole: Membership.roles.ADMIN,
          }).id;
          await databaseBuilder.commit();

          options.headers = generateAuthenticatedUserRequestHeaders({ userId });
          options.url = `/api/organizations/${organizationId}/sco-organization-learners/import-siecle`;
        });

        it('should respond with a 403 - Forbidden access', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when user is not ADMIN', function () {
        beforeEach(async function () {
          // given
          const organizationId = databaseBuilder.factory.buildOrganization({
            type: 'SCO',
            isManagingStudents: true,
          }).id;
          const userId = databaseBuilder.factory.buildUser.withMembership({
            organizationId,
            organizationRole: Membership.roles.MEMBER,
          }).id;
          await databaseBuilder.commit();

          options.headers = generateAuthenticatedUserRequestHeaders({ userId });
          options.url = `/api/organizations/${organizationId}/sco-organization-learners/import-siecle`;
        });

        it('should respond with a 403 - Forbidden access', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
