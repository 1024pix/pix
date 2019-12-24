const _ = require('lodash');
const iconv = require('iconv-lite');
const {
  expect, knex, nock, databaseBuilder,
  generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster,
} = require('../../../test-helper');

const createServer = require('../../../../server');
const areaRawAirTableFixture = require('../../../tooling/fixtures/infrastructure/areaRawAirTableFixture');

const Membership = require('../../../../lib/domain/models/Membership');

describe('Acceptance | Application | organization-controller-import-students', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  before(() => {
    nock('https://api.airtable.com')
      .get('/v0/test-base/Competences')
      .query(true)
      .reply(200, {
        'records': [{
          'id': 'recNv8qhaY887jQb2',
          'fields': {
            'Sous-domaine': '1.3',
            'Titre': 'Traiter des données',
          }
        }, {
          'id': 'recofJCxg0NqTqTdP',
          'fields': {
            'Sous-domaine': '4.2',
            'Titre': 'Protéger les données personnelles et la vie privée'
          },
        }]
      });

    nock('https://api.airtable.com')
      .get('/v0/test-base/Domaines')
      .query(true)
      .reply(200, [
        areaRawAirTableFixture()
      ]);
  });

  after(() => {
    nock.cleanAll();
  });

  beforeEach(async () => {
    await insertUserWithRolePixMaster();
  });

  describe('POST /api/organizations/{id}/import-students', () => {

    let organizationId;
    let options;

    const buffer = iconv.encode(
      '<?xml version="1.0" encoding="ISO-8859-15"?>' +
      '<BEE_ELEVES VERSION="2.1">' +
      '<DONNEES>' +
      '<ELEVES>' +
      '<ELEVE ELEVE_ID="0001">' +
      '<ID_NATIONAL>0000000001X</ID_NATIONAL>' +
      '<NOM_DE_FAMILLE>HANDMADE</NOM_DE_FAMILLE>' +
      '<NOM_USAGE></NOM_USAGE>' +
      '<PRENOM>Luciole</PRENOM>' +
      '<PRENOM2>Léa</PRENOM2>' +
      '<PRENOM3>Lucy</PRENOM3>' +
      '<DATE_NAISS>31/12/1994</DATE_NAISS>' +
      '<CODE_PAYS>100</CODE_PAYS>' +
      '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
      '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
      '<CODE_MEF>123456789</CODE_MEF>' +
      '<CODE_STATUT>AP</CODE_STATUT>' +
      '</ELEVE>' +
      '<ELEVE ELEVE_ID="0002">' +
      '<ID_NATIONAL>00000000124</ID_NATIONAL>' +
      '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
      '<NOM_USAGE>COJAUNE</NOM_USAGE>' +
      '<PRENOM>Harry</PRENOM>' +
      '<PRENOM2>Coco</PRENOM2>' +
      '<PRENOM3></PRENOM3>' +
      '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
      '<CODE_PAYS>132</CODE_PAYS>' +
      '<VILLE_NAISS>LONDRES</VILLE_NAISS>' +
      '<CODE_MEF>12341234</CODE_MEF>' +
      '<CODE_STATUT>ST</CODE_STATUT>' +
      '</ELEVE>' +
      '</ELEVES>' +
      '<STRUCTURES>' +
      '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
      '<STRUCTURE>' +
      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
      '</STRUCTURE>' +
      '</STRUCTURES_ELEVE>' +
      '<STRUCTURES_ELEVE ELEVE_ID="0002">' +
      '<STRUCTURE>' +
      '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
      '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
      '</STRUCTURE>' +
      '</STRUCTURES_ELEVE>' +
      '</STRUCTURES>' +
      '</DONNEES>' +
      '</BEE_ELEVES>', 'ISO-8859-15');

    beforeEach(async () => {
      const connectedUser = databaseBuilder.factory.buildUser();
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: connectedUser.id,
        organizationRole: Membership.roles.ADMIN
      });
      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: `/api/organizations/${organizationId}/import-students`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
        },
        payload: buffer
      };
    });

    afterEach(() => {
      return knex('students').delete();
    });

    context('Expected output', () => {

      it('should respond with a 204 - no content', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should save all students', async () => {
        // when
        await server.inject(options);

        // then
        const students = await knex('students').where({ organizationId });
        expect(students).to.have.lengthOf(2);
        expect(_.map(students, 'firstName')).to.have.members(['Luciole', 'Harry']);
      });

      it('should save some students', async () => {
        // given
        const malformedStudentsBuffer = iconv.encode(
          '<?xml version="1.0" encoding="ISO-8859-15"?>' +
          '<BEE_ELEVES VERSION="2.1">' +
          '<DONNEES>' +
          '<ELEVES>' +
          '<ELEVE ELEVE_ID="0001">' +
          '<ID_NATIONAL>00000000123</ID_NATIONAL>' +
          '<NOM_DE_FAMILLE>HANDMADE</NOM_DE_FAMILLE>' +
          '<NOM_USAGE></NOM_USAGE>' +
          '<PRENOM>Luciole</PRENOM>' +
          '<PRENOM2>Léa</PRENOM2>' +
          '<PRENOM3>Lucy</PRENOM3>' +
          '<DATE_NAISS>31/12/1994</DATE_NAISS>' +
          '<CODE_PAYS>100</CODE_PAYS>' +
          '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
          '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
          '<CODE_MEF>123456789</CODE_MEF>' +
          '<CODE_STATUT>AP</CODE_STATUT>' +
          '</ELEVE>' +
          '<ELEVE ELEVE_ID="0002">' +
          '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
          '<NOM_USAGE>COJAUNE</NOM_USAGE>' +
          '<PRENOM>Harry</PRENOM>' +
          '<PRENOM2>Coco</PRENOM2>' +
          '<PRENOM3></PRENOM3>' +
          '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
          '<CODE_PAYS>100</CODE_PAYS>' +
          '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
          '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
          '<CODE_MEF>12341234</CODE_MEF>' +
          '<CODE_STATUT>ST</CODE_STATUT>' +
          '</ELEVE>' +
          '<ELEVE ELEVE_ID="0003">' +
          '<ID_NATIONAL>00000000124</ID_NATIONAL>' +
          '<NOM_DE_FAMILLE>DAUMUR</NOM_DE_FAMILLE>' +
          '<PRENOM>Bran</PRENOM>' +
          '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
          '<CODE_PAYS>100</CODE_PAYS>' +
          '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
          '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
          '<CODE_MEF>12341234</CODE_MEF>' +
          '<CODE_STATUT>ST</CODE_STATUT>' +
          '</ELEVE>' +
          '<ELEVE ELEVE_ID="0004">' +
          '<ID_NATIONAL>00000000125</ID_NATIONAL>' +
          '<NOM_DE_FAMILLE>FRAS</NOM_DE_FAMILLE>' +
          '<PRENOM>Valentin</PRENOM>' +
          '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
          '<CODE_PAYS>100</CODE_PAYS>' +
          '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
          '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
          '<CODE_MEF>12341234</CODE_MEF>' +
          '<CODE_STATUT>ST</CODE_STATUT>' +
          '</ELEVE>' +
          '<ELEVE ELEVE_ID="0005">' +
          '<ID_NATIONAL>00000000126</ID_NATIONAL>' +
          '<NOM_DE_FAMILLE>VANDOU</NOM_DE_FAMILLE>' +
          '<PRENOM>Hubert</PRENOM>' +
          '<DATE_NAISS>31/08/2009</DATE_NAISS>' +
          '<DATE_SORTIE>01/09/2019</DATE_SORTIE>' +
          '<CODE_PAYS>100</CODE_PAYS>' +
          '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
          '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
          '<CODE_MEF>12341234</CODE_MEF>' +
          '<CODE_STATUT>ST</CODE_STATUT>' +
          '</ELEVE>' +
          '</ELEVES>' +
          '<STRUCTURES>' +
          '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
          '<STRUCTURE>' +
          '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
          '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
          '</STRUCTURE>' +
          '</STRUCTURES_ELEVE>' +
          '<STRUCTURES_ELEVE ELEVE_ID="0002">' +
          '<STRUCTURE>' +
          '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
          '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
          '</STRUCTURE>' +
          '</STRUCTURES_ELEVE>' +
          '<STRUCTURES_ELEVE ELEVE_ID="0004">' +
          '<STRUCTURE>' +
          '<CODE_STRUCTURE>Inactifs</CODE_STRUCTURE>' +
          '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
          '</STRUCTURE>' +
          '</STRUCTURES_ELEVE>' +
          '<STRUCTURES_ELEVE ELEVE_ID="0005">' +
          '<STRUCTURE>' +
          '<CODE_STRUCTURE>5B</CODE_STRUCTURE>' +
          '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
          '</STRUCTURE>' +
          '</STRUCTURES_ELEVE>' +
          '</STRUCTURES>' +
          '</DONNEES>' +
          '</BEE_ELEVES>', 'ISO-8859-15');
        options.payload = malformedStudentsBuffer;

        // when
        await server.inject(options);

        // then
        const students = await knex('students').where({ organizationId });
        expect(students).to.have.lengthOf(1);
        expect(students[0].lastName).to.equal('HANDMADE');
      });

      it('should save a student when he has already been imported but not in the same organization', async () => {
        // given
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildStudent({ nationalStudentId: '00000000124', organizationId: otherOrganizationId });
        await databaseBuilder.commit();

        const buffer = iconv.encode(
          '<?xml version="1.0" encoding="ISO-8859-15"?>' +
          '<BEE_ELEVES VERSION="2.1">' +
          '<DONNEES>' +
          '<ELEVES>' +
          '<ELEVE ELEVE_ID="0001">' +
          '<ID_NATIONAL>00000000124</ID_NATIONAL>' +
          '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
          '<NOM_USAGE>COJAUNE</NOM_USAGE>' +
          '<PRENOM>Harry</PRENOM>' +
          '<PRENOM2>Coco</PRENOM2>' +
          '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
          '<CODE_PAYS>132</CODE_PAYS>' +
          '<VILLE_NAISS>LONDRES</VILLE_NAISS>' +
          '<CODE_MEF>12341234</CODE_MEF>' +
          '<CODE_STATUT>ST</CODE_STATUT>' +
          '</ELEVE>' +
          '</ELEVES>' +
          '<STRUCTURES>' +
          '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
          '<STRUCTURE>' +
          '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
          '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
          '</STRUCTURE>' +
          '</STRUCTURES_ELEVE>' +
          '</STRUCTURES>' +
          '</DONNEES>' +
          '</BEE_ELEVES>', 'ISO-8859-15');

        options.payload = buffer;

        // when
        const response = await server.inject(options);

        // then
        const students = await knex('students').where({ nationalStudentId: '00000000124' });
        expect(students).to.have.lengthOf(2);
        expect(response.statusCode).to.equal(204);
      });

      it('should not update any student and return a 409 - Conflict - when a student cant be updated', async () => {

        // given
        const studentThatCantBeUpdatedBecauseBirthdateIsMissing =
          '<ELEVE ELEVE_ID="0001">' +
          '<ID_NATIONAL>00000000456</ID_NATIONAL>' +
          '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
          '<NOM_USAGE>COJAUNE</NOM_USAGE>' +
          '<PRENOM>Harry</PRENOM>' +
          '<PRENOM2>Coco</PRENOM2>' +
          '<PRENOM3></PRENOM3>' +
          '<DATE_NAISS></DATE_NAISS>' +
          '<CODE_PAYS>100</CODE_PAYS>' +
          '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
          '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
          '<CODE_MEF>12341234</CODE_MEF>' +
          '<CODE_STATUT>ST</CODE_STATUT>' +
          '</ELEVE>';

        const studentThatCouldBeUpdated =
          '<ELEVE ELEVE_ID="0002">' +
          '<ID_NATIONAL>00000000123</ID_NATIONAL>' +
          '<NOM_DE_FAMILLE>JAUNE</NOM_DE_FAMILLE>' +
          '<NOM_USAGE></NOM_USAGE>' +
          '<PRENOM>ATTEND</PRENOM>' +
          '<PRENOM2></PRENOM2>' +
          '<PRENOM3></PRENOM3>' +
          '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
          '<CODE_PAYS>100</CODE_PAYS>' +
          '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
          '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
          '<CODE_MEF>12341234</CODE_MEF>' +
          '<CODE_STATUT>ST</CODE_STATUT>' +
          '</ELEVE>';

        const bufferWithMalformedStudent = iconv.encode(
          '<?xml version="1.0" encoding="ISO-8859-15"?>' +
          '<BEE_ELEVES VERSION="2.1">' +
          '<DONNEES>' +
          '<ELEVES>' +
          studentThatCantBeUpdatedBecauseBirthdateIsMissing +
          studentThatCouldBeUpdated +
          '</ELEVES>' +
          '<STRUCTURES>' +
          '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
          '<STRUCTURE>' +
          '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
          '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
          '</STRUCTURE>' +
          '</STRUCTURES_ELEVE>' +
          '<STRUCTURES_ELEVE ELEVE_ID="0002">' +
          '<STRUCTURE>' +
          '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
          '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
          '</STRUCTURE>' +
          '</STRUCTURES_ELEVE>' +
          '</STRUCTURES>' +
          '</DONNEES>' +
          '</BEE_ELEVES>', 'ISO-8859-15');

        options.payload = bufferWithMalformedStudent;

        databaseBuilder.factory.buildStudent({
          lastName: 'LALOUX',
          firstName: 'RENE',
          nationalStudentId: '123',
          organizationId
        });
        databaseBuilder.factory.buildStudent({
          lastName: 'UEMATSU',
          firstName: 'NOBUO',
          nationalStudentId: '456',
          organizationId
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        const students = await knex('students').where({ organizationId });
        expect(_.map(students, 'lastName')).to.have.members(['LALOUX', 'UEMATSU']);
        expect(response.statusCode).to.equal(409);
        expect(response.result.errors[0].detail).to.equal('L\'enregistrement des élèves a rencontré une erreur.');

      });

      it('should return a 409 - Conflict - when a student cant be imported', async () => {
        // given
        const malformedStudentsBuffer = iconv.encode(
          '<?xml version="1.0" encoding="ISO-8859-15"?>' +
          '<BEE_ELEVES VERSION="2.1">' +
          '<DONNEES>' +
          '<ELEVES>' +
          '<ELEVE ELEVE_ID="0001">' +
          '<ID_NATIONAL>123</ID_NATIONAL>' +
          '<NOM_DE_FAMILLE>WRONG</NOM_DE_FAMILLE>' +
          '<PRENOM>Person</PRENOM>' +
          '</ELEVE>' +
          '</ELEVES>' +
          '<STRUCTURES>' +
          '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
          '<STRUCTURE>' +
          '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
          '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
          '</STRUCTURE>' +
          '</STRUCTURES_ELEVE>' +
          '</STRUCTURES>' +
          '</DONNEES>' +
          '</BEE_ELEVES>', 'ISO-8859-15');
        options.payload = malformedStudentsBuffer;

        // when
        const response = await server.inject(options);

        // then
        const students = await knex('students').where({ organizationId });
        expect(students).to.have.lengthOf(0);
        expect(response.statusCode).to.equal(409);
        expect(response.result.errors[0].detail).to.equal('L\'enregistrement des élèves a rencontré une erreur.');
      });

      it('should return a 422 - Unprocessable Entity - when file in not properly formated', async () => {
        // given
        const malformedBuffer = iconv.encode(
          '<?xml version="1.0" encoding="ISO-8859-15"?>' +
          '<BEE_ELEVES VERSION="2.1">' +
          '</BEE_ELEVES>', 'ISO-8859-15');
        options.payload = malformedBuffer;

        // when
        const response = await server.inject(options);

        // then
        const students = await knex('students').where({ organizationId });
        expect(students).to.have.lengthOf(0);
        expect(response.statusCode).to.equal(422);
        expect(response.result.errors[0].detail).to.equal('Aucun élève n\'a pu être importé depuis ce fichier. Vérifiez sa conformité.');
      });
    });

    context('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - Forbidden access - if user does not belong to Organization', async () => {
        // given
        const userId = databaseBuilder.factory.buildUser.withMembership().id;
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 403 - Forbidden access - if Organization type is not SCO', async () => {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'PRO', isManagingStudents: true }).id;
        const userId = databaseBuilder.factory.buildUser.withMembership({
          organizationId,
          organizationRole: Membership.roles.ADMIN
        }).id;
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        options.url = `/api/organizations/${organizationId}/import-students`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 403 - Forbidden access - if Organization does not manage students', async () => {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: false }).id;
        const userId = databaseBuilder.factory.buildUser.withMembership({
          organizationId,
          organizationRole: Membership.roles.ADMIN
        }).id;
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        options.url = `/api/organizations/${organizationId}/import-students`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 403 - Forbidden access - if user is not ADMIN', async () => {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
        const userId = databaseBuilder.factory.buildUser.withMembership({
          organizationId,
          organizationRole: Membership.roles.MEMBER
        }).id;
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        options.url = `/api/organizations/${organizationId}/import-students`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
