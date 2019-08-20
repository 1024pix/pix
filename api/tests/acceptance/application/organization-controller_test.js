const jwt = require('jsonwebtoken');
const { expect, knex, nock, databaseBuilder, generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster, cleanupUsersAndPixRolesTables } = require('../../test-helper');
const Membership = require('../../../lib/domain/models/Membership');
const createServer = require('../../../server');
const settings = require('../../../lib/settings');
const areaRawAirTableFixture = require('../../tooling/fixtures/infrastructure/areaRawAirTableFixture');
const _ = require('lodash');

async function _insertOrganization(userId) {
  const organization = databaseBuilder.factory.buildOrganization({
    name: 'The name of the organization',
    type: 'SUP',
    code: 'AAA111',
    userId
  });
  await databaseBuilder.commit();
  return organization;
}

async function _insertUser() {
  const user = databaseBuilder.factory.buildUser({
    firstName: 'john',
    lastName: 'Doe',
    email: 'john.Doe@internet.fr',
    password: 'Pix2017!'
  });

  await databaseBuilder.commit();
  return user;
}

function _insertSnapshot(organizationId, userId) {
  const serializedUserProfile = {
    data: {
      type: 'users',
      id: userId,
      attributes: {
        'first-name': 'John',
        'last-name': 'Doe',
        'total-pix-score': 15,
        'email': 'john.Doe@internet.fr'
      },
      relationships: {
        competences: {
          data: [
            { type: 'competences', id: 'recCompA' },
            { type: 'competences', id: 'recCompB' }
          ]
        }
      },
    },
    included: [
      {
        type: 'areas',
        id: 'recAreaA',
        attributes: {
          name: 'area-name-1'
        }
      },
      {
        type: 'areas',
        id: 'recAreaB',
        attributes: {
          name: 'area-name-2'
        }
      },
      {
        type: 'competences',
        id: 'recCompA',
        attributes: {
          name: 'Traiter des données',
          index: '1.3',
          level: -1,
          'course-id': 'recBxPAuEPlTgt72q11'
        },
        relationships: {
          area: {
            data: {
              type: 'areas',
              id: 'recAreaA'
            }
          }
        }
      },
      {
        type: 'competences',
        id: 'recCompB',
        attributes: {
          name: 'Protéger les données personnelles et la vie privée',
          index: '4.2',
          level: 8,
          'pix-score': 128,
          'course-id': 'recBxPAuEPlTgt72q99'
        },
        relationships: {
          area: {
            data: {
              type: 'areas',
              id: 'recAreaB'
            }
          }
        }
      }
    ]
  };
  const snapshotRaw = {
    organizationId: organizationId,
    testsFinished: 1,
    userId,
    score: 15,
    profile: JSON.stringify(serializedUserProfile),
    createdAt: new Date('2017-08-31T15:57:06Z')
  };

  return knex('snapshots').insert(snapshotRaw).returning('id');
}

function _createToken(user) {
  return jwt.sign({
    user_id: user,
  }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });
}

describe('Acceptance | Application | organization-controller', () => {

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

  beforeEach(() => {
    return insertUserWithRolePixMaster();
  });

  afterEach(() => {
    return cleanupUsersAndPixRolesTables();
  });

  describe('POST /api/organizations', () => {
    let payload;
    let options;

    beforeEach(() => {
      payload = {
        data: {
          type: 'organizations',
          attributes: {
            name: 'The name of the organization',
            type: 'PRO',
          }
        }
      };
      options = {
        method: 'POST',
        url: '/api/organizations',
        payload,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
    });

    afterEach(() => {
      return knex('organizations').delete();
    });

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should create and return the new organization', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const createdOrganization = response.result.data.attributes;
        expect(createdOrganization.name).to.equal('The name of the organization');
        expect(createdOrganization.type).to.equal('PRO');
        expect(createdOrganization.code).not.to.be.empty;
        expect(createdOrganization.user).to.be.undefined;
      });
    });

    describe('when creating with a wrong payload (ex: organization type is wrong)', () => {

      it('should return 422 HTTP status code', () => {
        // given
        payload.data.attributes.type = 'FAK';

        // then
        const creatingOrganizationOnFailure = server.inject(options);

        // then
        return creatingOrganizationOnFailure.then((response) => {
          expect(response.statusCode).to.equal(422);
        });
      });

      it('should not keep the user in the database', () => {
        // given
        payload.data.attributes.type = 'FAK';

        // then
        const creatingOrganizationOnFailure = server.inject(options);

        // then
        return creatingOrganizationOnFailure
          .then(() => {
            return knex('users').count('id as id').then((count) => {
              expect(parseInt(count[0].id, 10)).to.equal(1);
            });
          });
      });

    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', () => {
        // given
        const nonPixMAsterUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMAsterUserId);

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('GET /api/organizations', () => {
    let userId;
    const options = {
      method: 'GET',
      url: '/api/organizations?code=AAA111&type=Sup&name=the',
      headers: {},
    };

    beforeEach(() => {
      return _insertUser()
        .then(({ id }) => userId = id)
        .then(() => options.headers.authorization = generateValidRequestAuthorizationHeader(userId))
        .then(() => _insertOrganization(userId));
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return application/json', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    it('should return the expected organization', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        // then
        const organization = response.result.data[0];
        expect(organization.attributes.name).to.equal('The name of the organization');
        expect(organization.attributes.type).to.equal('SUP');
        expect(organization.attributes.code).to.equal('AAA111');
        expect(organization.attributes.user).to.be.undefined;
      });
    });

  });

  describe('GET /api/organizations/{id}/snapshots/export?userToken={userToken}', () => {
    const payload = {};
    let organizationId;
    let userToken;
    let userId;

    beforeEach(() => {
      return _insertUser()
        .then(({ id }) => userId = id)
        .then(() => userToken = _createToken(userId))
        .then(() => _insertOrganization(userId))
        .then(({ id }) => organizationId = id)
        .then(() => _insertSnapshot(organizationId, userId));
    });

    afterEach(async () => {
      await databaseBuilder.clean();
      await knex('snapshots').delete()
        .then(() => knex('organizations').delete());
    });

    it('should return 200 HTTP status code', () => {
      // given
      const url = `/api/organizations/${organizationId}/snapshots/export?userToken=${userToken}`;
      const expectedCsvSnapshots = '\uFEFF"Nom";"Prénom";"Numéro Étudiant";"Code Campagne";"Date";"Score Pix";' +
        '"Tests Réalisés";"Traiter des données";"Protéger les données personnelles et la vie privée"\n' +
        '"Doe";"john";"";"";31/08/2017;15;="1/2";;8\n';

      const request = {
        method: 'GET',
        url,
        payload,
      };

      // when
      const promise = server.inject(request);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedCsvSnapshots);
      });
    });
  });

  describe('GET /api/organizations/{id}/campaigns', () => {

    const orga1Campaign1 = {
      id: 1,
      name: 'Quand Peigne numba one',
      code: 'ATDGRK343',
      organizationId: 1,
      creatorId: 2,
    };

    const orga1Campaign2 = {
      id: 2,
      name: 'Quand Peigne numba two',
      code: 'KFCTSU984',
      organizationId: 1,
      creatorId: 3,
    };

    const orga2Campaign1 = {
      id: 3,
      name: 'Quand Peigne otha orga',
      code: 'CPFTQX735',
      organizationId: 2,
      creatorId: 3,
    };
    const campaigns = [orga1Campaign1, orga1Campaign2, orga2Campaign1];

    const campaignParticipation = {
      campaignId: orga2Campaign1.id,
      isShared: true
    };

    beforeEach(async () => {
      campaigns.forEach((campaign) => {
        databaseBuilder.factory.buildCampaign(campaign);
      });

      databaseBuilder.factory.buildCampaignParticipation(campaignParticipation);
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('Retrieve campaigns with campaignReports', () => {
      it('should return the organization campaigns', () => {
        // given
        const organizationId = 1;
        const options = {
          method: 'GET',
          url: '/api/organizations/' + organizationId + '/campaigns',
          headers: {
            authorization: generateValidRequestAuthorizationHeader()
          },
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          const campaigns = response.result.data;
          expect(campaigns).to.have.lengthOf(2);
          expect(_.map(campaigns, 'attributes.name')).to.have.members([orga1Campaign1.name, orga1Campaign2.name]);
          expect(_.map(campaigns, 'attributes.code')).to.have.members([orga1Campaign1.code, orga1Campaign2.code]);
        });
      });

      it('should return the campaignReports with the campaigns', async () => {
        // given
        const organizationId = 2;
        const options = {
          method: 'GET',
          url: '/api/organizations/' + organizationId + '/campaigns',
          headers: {
            authorization: generateValidRequestAuthorizationHeader()
          },
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          const campaigns = response.result.data;
          expect(campaigns).to.have.lengthOf(1);
          const campaignReport = response.result.included[0].attributes;
          expect(campaignReport['participations-count']).to.equal(1);
          expect(campaignReport['shared-participations-count']).to.equal(1);
        });
      });
    });
  });

  describe('GET /api/organizations/{id}', () => {

    let organization;
    let options;

    context('Expected output', () => {

      beforeEach(async () => {
        const userPixMaster = databaseBuilder.factory.buildUser.withPixRolePixMaster();
        organization = databaseBuilder.factory.buildOrganization();

        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/organizations/${organization.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userPixMaster.id) },
        };

      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return the matching organization as JSON API', async () => {
        // given
        const expectedResult = {
          'data': {
            'attributes': {
              'code': organization.code,
              'name': organization.name,
              'type': organization.type,
              'logo-url': organization.logoUrl,
              'external-id': organization.externalId,
              'is-managing-students': organization.isManagingStudents,
            },
            'id': organization.id.toString(),
            'relationships': {
              'user': {
                'data': null,
              },
              'memberships': {
                'links': {
                  'related': `/api/organizations/${organization.id}/memberships`
                }
              },
              'students': {
                'links': {
                  'related': `/api/organizations/${organization.id}/students`
                }
              }
            },
            'type': 'organizations'
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result).to.deep.equal(expectedResult);
      });

      it('should return a 404 error when organization was not found', () => {
        // given
        options.url = '/api/organizations/999';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.result).to.deep.equal({
            'errors': [{
              'status': '404',
              'detail': 'Not found organization for ID 999',
              'title': 'Not Found',
            }]
          });
        });
      });
    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', () => {
        // given
        const nonPixMAsterUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMAsterUserId);

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('GET /api/organizations/{id}/memberships', () => {

    let organization;
    let options;

    beforeEach(async () => {
      const userPixMaster = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      organization = databaseBuilder.factory.buildOrganization();
      options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/memberships`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userPixMaster.id) },
      };
    });

    context('Expected output', () => {

      let user;
      let membershipId;

      beforeEach(async () => {
        user = databaseBuilder.factory.buildUser();

        membershipId = databaseBuilder.factory.buildMembership({
          userId: user.id,
          organizationId: organization.id,
        }).id;

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return the matching organization as JSON API', async () => {
        // given
        const expectedResult = {
          'data': [
            {
              'attributes': {
                'organization-role': 'MEMBER',
              },
              'id': membershipId.toString(),
              'relationships': {
                'organization': {
                  'data': null
                },
                'user': {
                  'data': {
                    'id': user.id.toString(),
                    'type': 'users'
                  }
                },
              },
              'type': 'memberships'
            }
          ],
          'included': [
            {
              'attributes': {
                'email': user.email,
                'first-name': user.firstName,
                'last-name': user.lastName,
              },
              'id': user.id.toString(),
              'type': 'users'
            }
          ]
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedResult);
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

      it('should respond with a 403 - forbidden access - if user is not OWNER in organization nor PIX_MASTER', async () => {
        // given
        const nonPixMasterUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMasterUserId);

        databaseBuilder.factory.buildUser.withMembership({
          id: nonPixMasterUserId,
          organizationId: organization.id,
          organizationRole: Membership.roles.MEMBER
        });

        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/organizations/{id}/add-membership', () => {

    let organization;
    let options;

    beforeEach(async () => {
      const userPixMaster = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      organization = databaseBuilder.factory.buildOrganization();
      options = {
        method: 'POST',
        url: `/api/organizations/${organization.id}/add-membership`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userPixMaster.id) },
        payload: {
          email: 'dev@example.net'
        }
      };
    });

    context('Expected output', () => {

      let user;

      beforeEach(async () => {
        const ownerUser = databaseBuilder.factory.buildUser();
        user = databaseBuilder.factory.buildUser({ id: 123, email: options.payload.email });
        databaseBuilder.factory.buildMembership({
          userId: ownerUser.id,
          organizationId: organization.id,
          organizationRole: Membership.roles.OWNER,
        });

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await knex('memberships').delete();
        await databaseBuilder.clean();
      });

      it('should return the matching organization as JSON API', async () => {
        // given
        const attributes = {
          'organization-role': 'MEMBER'
        };

        const relationships = {
          organization: {
            data: null
          },
          user: {
            data: {
              id: user.id.toString(),
              type: 'users'
            }
          }
        };

        const included = [{
          attributes: {
            email: user.email,
            'first-name': user.firstName,
            'last-name': user.lastName,
          },
          id: user.id.toString(),
          type: 'users'
        }];

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.included).to.deep.equal(included);
        expect(response.result.data.relationships).to.deep.equal(relationships);
        expect(response.result.data.relationships).to.deep.equal(relationships);
        expect(response.result.data.type).to.equal('memberships');
        expect(response.result.data.attributes).to.deep.equal(attributes);
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

      it('should respond with a 403 - forbidden access - if user is not OWNER in organization nor PIX_MASTER', async () => {
        // given
        const nonPixMasterUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMasterUserId);

        databaseBuilder.factory.buildUser.withMembership({
          id: nonPixMasterUserId,
          organizationId: organization.id,
          organizationRole: Membership.roles.MEMBER
        });

        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 404 - not found - if given email is not linked to an existing user', async () => {
        // given
        options.payload.email = 'fakeEmail';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond with a 421 - precondition failed - if user is already member of organization', async () => {
        // given
        const userAlreadyInDB = databaseBuilder.factory.buildUser({ id: 123, email: options.payload.email });
        databaseBuilder.factory.buildMembership({ userId: userAlreadyInDB.id, organizationId: organization.id });

        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(421);
      });
    });
  });

  describe('GET /api/organizations/{id}/students', () => {

    let organization;
    let options;

    beforeEach(async () => {
      const connectedUser = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: connectedUser.id });
      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/organizations/${organization.id}/students`,
        headers: { authorization: generateValidRequestAuthorizationHeader(connectedUser.id) },
      };
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('Expected output', () => {

      let student;

      beforeEach(async () => {
        student = databaseBuilder.factory.buildStudent({
          organizationId: organization.id,
        });

        await databaseBuilder.commit();
      });

      it('should return the matching students as JSON API', async () => {
        // given
        const expectedResult = {
          'data': [
            {
              'attributes': {
                'last-name': student.lastName,
                'first-name': student.firstName,
                'birthdate': student.birthdate,
              },
              'id': student.id.toString(),
              'type': 'students'
            }
          ],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedResult);
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
        const userId = databaseBuilder.factory.buildUser.withMembership({ organizationId }).id;
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        options.url = `/api/organizations/${organizationId}/students`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 403 - Forbidden access - if Organization does not manage students', async () => {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: false }).id;
        const userId = databaseBuilder.factory.buildUser.withMembership({ organizationId }).id;
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        options.url = `/api/organizations/${organizationId}/students`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('POST /api/organizations/{id}/students', () => {

    let organization;
    let options;

    const file = '<?xml version="1.0" encoding="ISO-8859-15"?>' +
      '<BEE_ELEVES VERSION="2.1">' +
      '<DONNEES>' +
      '<ELEVES>' +
      '<ELEVE ELEVE_ID="0001">' +
      '<ID_NATIONAL>0000000001X</ID_NATIONAL>' +
      '<INE_RNIE>00000000123</INE_RNIE>' +
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
      '<ID_NATIONAL>0000000001X</ID_NATIONAL>' +
      '<INE_RNIE>00000000124</INE_RNIE>' +
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
      '</BEE_ELEVES>';

    beforeEach(async () => {
      const connectedUser = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: connectedUser.id, organizationRole: Membership.roles.OWNER });
      await databaseBuilder.commit();

      const payload = Buffer.from(
        '------WebKitFormBoundaryxSSpu5dJeHVmxnBq\r\n' +
        'Content-Disposition: form-data; name="Content-Type"\r\n' +
        '\r\n' +
        'text/xml\r\n' +
        '------WebKitFormBoundaryxSSpu5dJeHVmxnBq\r\n' +
        'Content-Disposition: form-data; name="file"; filename="file.xml"\r\n' +
        'Content-Type: text/xml\r\n' +
        '\r\n' +
        file + '\r\r\n' +
        '------WebKitFormBoundaryxSSpu5dJeHVmxnBq--', 'latin1');

      options = {
        method: 'POST',
        url: `/api/organizations/${organization.id}/students`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(connectedUser.id),
          'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryxSSpu5dJeHVmxnBq'
        },
        payload
      };
    });

    afterEach(async () => {
      await knex('students').delete();
      await databaseBuilder.clean();
    });

    context('Expected output', () => {

      it('should return the last student id', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result).to.be.a('number');
      });

      it('should save all students', async () => {
        // when
        await server.inject(options);

        // then
        const students = await knex('students').where({ organizationId: organization.id });
        expect(students).to.have.lengthOf(2);
        expect(students[0].firstName).to.equal('Luciole');
        expect(students[0].middleName).to.equal('Léa');
        expect(students[0].lastName).to.equal('HANDMADE');
        expect(students[0].birthdate).to.equal('1994-12-31');
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
        const userId = databaseBuilder.factory.buildUser.withMembership({ organizationId, organizationRole: Membership.roles.OWNER }).id;
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        options.url = `/api/organizations/${organizationId}/students`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 403 - Forbidden access - if Organization does not manage students', async () => {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: false }).id;
        const userId = databaseBuilder.factory.buildUser.withMembership({ organizationId, organizationRole: Membership.roles.OWNER }).id;
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        options.url = `/api/organizations/${organizationId}/students`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 403 - Forbidden access - if user is not OWNER', async () => {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
        const userId = databaseBuilder.factory.buildUser.withMembership({ organizationId, organizationRole: Membership.roles.MEMBER }).id;
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);
        options.url = `/api/organizations/${organizationId}/students`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
