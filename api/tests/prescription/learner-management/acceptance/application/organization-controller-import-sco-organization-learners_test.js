import { EventEmitter } from 'node:events';

import iconv from 'iconv-lite';
import _ from 'lodash';

import { OrganizationLearnerImportHeader } from '../../../../../src/prescription/learner-management/infrastructure/serializers/csv/organization-learner-import-header.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
} from '../../../../test-helper.js';
import { getI18n } from '../../../../tooling/i18n/i18n.js';

EventEmitter.defaultMaxListeners = 60;

const i18n = getI18n();

const organizationLearnerCsvColumns = new OrganizationLearnerImportHeader(i18n).columns
  .map((column) => column.name)
  .join(';');

describe('Acceptance | Application | organization-controller-import-sco-organization-learners', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

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
        headers: {
          authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
        },
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

          (options.url = `/api/organizations/${organizationId}/sco-organization-learners/import-siecle?format=csv`),
            (options.payload = buffer);
        });

        it('should respond with a 204 - no content', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });

        it('should create all organizationLearners', async function () {
          // when
          await server.inject(options);

          // then
          const organizationLearners = await knex('organization-learners').where({ organizationId });
          expect(organizationLearners).to.have.lengthOf(2);
          expect(_.map(organizationLearners, 'firstName')).to.have.members(['Beatrix', 'O-Ren']);
        });
      });

      context('SCO : when no organization learner has been imported yet', function () {
        beforeEach(function () {
          const input = `${organizationLearnerCsvColumns}
            123F;Beatrix;The;Bride;Kiddo;Black Mamba;Féminin;01/01/1970;97422;;200;99100;ST;MEF1;Division 1;
            456F;O-Ren;;;Ishii;Cottonmouth;Masculin;01/01/1980;;Shangai;99;99132;ST;MEF1;Division 2;
            `;
          const buffer = iconv.encode(input, 'UTF-8');

          (options.url = `/api/organizations/${organizationId}/sco-organization-learners/import-siecle?format=csv`),
            (options.payload = buffer);
        });

        it('should respond with a 204 - no content', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });

        it('should create all organizationLearners', async function () {
          // when
          await server.inject(options);

          // then
          const organizationLearners = await knex('organization-learners').where({ organizationId });
          expect(organizationLearners).to.have.lengthOf(2);
          expect(_.map(organizationLearners, 'firstName')).to.have.members(['Beatrix', 'O-Ren']);
          expect(_.map(organizationLearners, 'sex')).to.have.members(['F', 'M']);
        });
      });

      context('when some organization learners data are not well formatted', function () {
        it('should not save any organization learner with missing family name', async function () {
          // given
          const input = `${organizationLearnerCsvColumns}
           123F;Beatrix;The;Bride;Kiddo;Black Mamba;Féminin;01/01/1970;97422;;200;99100;ST;MEF1;Division 1;
           456F;O-Ren;;;;Cottonmouth;Féminin;01/01/1980;;Shangai;99;99132;ST;MEF1;Division 2;
           `;
          const buffer = iconv.encode(input, 'UTF-8');

          (options.url = `/api/organizations/${organizationId}/sco-organization-learners/import-siecle?format=csv`),
            (options.payload = buffer);

          // when
          const response = await server.inject(options);

          // then
          const organizationLearners = await knex('organization-learners').where({ organizationId });
          expect(organizationLearners).to.have.lengthOf(0);
          expect(response.statusCode).to.equal(412);
          expect(response.result.errors).lengthOf(1);
          expect(response.result.errors[0].code).to.equal('FIELD_REQUIRED');
          expect(response.result.errors[0].meta.field).to.equal('Nom de famille*');
        });

        it('should not save any organization learner with wrong birthCountryCode', async function () {
          const wrongData = 'FRANC';
          // given
          const input = `${organizationLearnerCsvColumns}
           123F;Beatrix;The;Bride;Kiddo;Black Mamba;Féminin;01/01/1970;51430;Reims;200;${wrongData};ST;MEF1;Division 1;
           `;
          const buffer = iconv.encode(input, 'UTF-8');

          (options.url = `/api/organizations/${organizationId}/sco-organization-learners/import-siecle?format=csv`),
            (options.payload = buffer);

          // when
          const response = await server.inject(options);

          // then
          const organizationLearners = await knex('organization-learners').where({ organizationId });

          expect(organizationLearners).to.have.lengthOf(0);
          expect(response.statusCode).to.equal(412);
          expect(response.result.errors[0].code).to.equal('INSEE_CODE_INVALID');
          expect(response.result.errors[0].meta.field).to.equal('Code pays naissance*');
        });

        it('should not save any organization learner with wrong birthCityCode', async function () {
          const wrongData = 'A1234';
          // given
          const input = `${organizationLearnerCsvColumns}
           123F;Beatrix;The;Bride;Kiddo;Black Mamba;Féminin;01/01/1970;${wrongData};Reims;200;99100;ST;MEF1;Division 1;
           `;
          const buffer = iconv.encode(input, 'UTF-8');

          (options.url = `/api/organizations/${organizationId}/sco-organization-learners/import-siecle?format=csv`),
            (options.payload = buffer);

          // when
          const response = await server.inject(options);

          // then
          const organizationLearners = await knex('organization-learners').where({ organizationId });

          expect(organizationLearners).to.have.lengthOf(0);
          expect(response.statusCode).to.equal(412);
          expect(response.result.errors[0].code).to.equal('INSEE_CODE_INVALID');
          expect(response.result.errors[0].meta.field).to.equal('Code commune naissance**');
        });
      });

      context(
        'when an organization learner has the same national student id than an other one in the file',
        function () {
          beforeEach(function () {
            const input = `${organizationLearnerCsvColumns}
          123F;Beatrix;The;Bride;Kiddo;Black Mamba;Féminin;01/01/1970;97422;;200;99100;ST;MEF1;Division 1;
          123F;O-Ren;;;Ishii;Cottonmouth;Féminin;01/01/1980;99;Shangai;200;99132;ST;MEF1;Division 2;
          `;
            const buffer = iconv.encode(input, 'UTF-8');

            (options.url = `/api/organizations/${organizationId}/sco-organization-learners/import-siecle?format=csv`),
              (options.payload = buffer);
          });

          it('should not import any organizationLearner and return a 412', async function () {
            // when
            const response = await server.inject(options);

            // then
            const organizationLearners = await knex('organization-learners').where({ organizationId });

            expect(organizationLearners).to.have.lengthOf(0);
            expect(response.statusCode).to.equal(412);
            expect(response.result.errors[0].code).to.equal('IDENTIFIER_UNIQUE');
          });
        },
      );
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

          options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
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

          options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
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

          options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
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

          options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
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
