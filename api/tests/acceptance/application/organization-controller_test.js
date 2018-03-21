const jwt = require('jsonwebtoken');
const { expect, knex, nock, generateValidRequestAuhorizationHeader, insertUserWithRolePixMaster, cleanupUsersAndPixRolesTables } = require('../../test-helper');
const server = require('../../../server');
const settings = require('../../../lib/settings');

function _insertOrganization(userId) {
  const organizationRaw = {
    name: 'The name of the organization',
    email: 'organization@email.com',
    type: 'SUP',
    code: 'AAA111',
    userId
  };

  return knex('organizations').insert(organizationRaw)
    .then(organization => organization.shift());
}

function _insertUser() {
  const userRaw = {
    'firstName': 'john',
    'lastName': 'Doe',
    'email': 'john.Doe@internet.fr',
    password: 'Pix2017!'
  };

  return knex('users').insert(userRaw)
    .then(user => user.shift());
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
    createdAt: '2017-08-31 15:57:06'
  };

  return knex('snapshots')
    .insert(snapshotRaw);
}

function _createToken(user) {
  return jwt.sign({
    user_id: user,
  }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });
}

describe('Acceptance | Application | Controller | Organization', () => {

  before(() => {
    nock('https://api.airtable.com')
      .get('/v0/test-base/Competences')
      .query({
        sort: [{
          field: 'Sous-domaine',
          direction: 'asc'
        }]
      })
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
      }
      );
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
            email: 'organization@email.com',
            type: 'PRO',
            'first-name': 'Steve',
            'last-name': 'Travail',
            password: 'Pix1024#'
          }
        }
      };
      options = {
        method: 'POST',
        url: '/api/organizations',
        payload,
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };
    });

    afterEach(() => {
      return Promise.all([
        knex('users').delete(),
        knex('organizations').delete()
      ]);
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
      return server.inject(options).then((response) => {
        const organizationInResponse = response.result.data.attributes;
        expect(organizationInResponse.name).to.equal('The name of the organization');
        expect(organizationInResponse.email).to.equal('organization@email.com');
        expect(organizationInResponse.type).to.equal('PRO');
        expect(organizationInResponse.code).not.to.be.empty;
        expect(organizationInResponse.user).to.be.undefined;
      });
    });

    it('should return 400 HTTP status code when creating two organizations with the same email', () => {
      // given
      const createFirstOrganization = server.inject(options);

      // then
      const secondOrganizationOnFailure = createFirstOrganization.then(() => {
        return server.inject(options);
      });

      // then
      return secondOrganizationOnFailure.then((response) => {
        const parsedResponse = JSON.parse(response.payload);
        expect(parsedResponse.errors[0].detail).to.equal('L\'adresse organization@email.com est déjà associée à un utilisateur.');
        expect(response.statusCode).to.equal(400);
      });
    });

    describe('when creating with a wrong payload', () => {

      it('should return 400 HTTP status code', () => {
        // given
        payload.data.attributes.type = 'FAK';

        // then
        const creatingOrganizationOnFailure = server.inject(options);

        // then
        return creatingOrganizationOnFailure.then((response) => {
          const parsedResponse = JSON.parse(response.payload);
          expect(parsedResponse.errors[0].detail).to.equal('Le type d\'organisation doit être l\'une des valeurs suivantes: SCO, SUP, PRO.');
          expect(response.statusCode).to.equal(400);
        });
      });

      it('should return both User and Organization errors at the same time', () => {
        // given
        payload.data.attributes.type = 'FAK';
        payload.data.attributes.password = 'invalid-password';

        // then
        const creatingOrganizationOnFailure = server.inject(options);

        // then
        return creatingOrganizationOnFailure
          .then((response) => {
            const parsedResponse = JSON.parse(response.payload);

            expect(parsedResponse.errors).to.have.lengthOf(2);
            expect(parsedResponse.errors[1].detail).to.equal('Le type d\'organisation doit être l\'une des valeurs suivantes: SCO, SUP, PRO.');
            expect(parsedResponse.errors[0].detail).to.equal('Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.');
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
              expect(count[0].id).to.equal(1);
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
        options.headers.authorization = generateValidRequestAuhorizationHeader(nonPixMAsterUserId);

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('GET /api/organizations/{id}/snapshots', () => {
    const payload = {};
    let organizationId;
    let userId;
    let snapshotId;

    before(() => {
      return _insertUser()
        .then((user_id) => {
          userId = user_id;
          return _insertOrganization(userId);
        })
        .then((organization_id) => {
          organizationId = organization_id;
          return _insertSnapshot(organizationId, userId);
        })
        .then((snapshot_id) => {
          snapshotId = snapshot_id[0];
        });
    });

    after(() => {
      return Promise.all([
        knex('users').delete(),
        knex('organizations').delete(),
        knex('snapshots').delete()
      ]);
    });

    it('should return 200 HTTP status code', () => {
      // given
      const url = `/api/organizations/${organizationId}/snapshots`;
      const expectedSnapshots = {
        data:
          [{
            type: 'snapshots',
            id: snapshotId,
            attributes: {
              score: '15',
              'tests-finished': '1',
              'created-at': '2017-08-31 15:57:06',
              'student-code': null,
              'campaign-code': null
            },
            relationships: {
              user: {
                data: {
                  'id': userId.toString(),
                  'type': 'users'
                }
              }
            }
          }],
        included: [
          {
            type: 'users',
            id: userId.toString(),
            attributes: {
              'first-name': 'john',
              'last-name': 'Doe'
            }
          }
        ]
      };
      const options = {
        method: 'GET',
        url,
        payload,
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedSnapshots);
      });
    });

    it('should return 200, when no snapshot was found', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/organizations/unknownId/snapshots',
        payload: {},
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.result.data).to.have.lengthOf(0);
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/organizations', () => {
    let userId;

    before(() => {
      return _insertUser()
        .then((user_id) => {
          userId = user_id;
          return _insertOrganization(userId);
        });
    });

    after(() => {
      return Promise.all([knex('users').delete(), knex('organizations').delete()]);
    });

    const options = {
      method: 'GET',
      url: '/api/organizations?filter[code]=AAA111',
      headers: { authorization: generateValidRequestAuhorizationHeader() },
    };

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return application/json', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    it('should return the expected organization with no email nor user', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        // then
        const organization = response.result.data[0];
        expect(organization.attributes.name).to.equal('The name of the organization');
        expect(organization.attributes.email).to.be.undefined;
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

    before(() => {
      return _insertUser()
        .then((user_id) => {
          userId = user_id;
          userToken = _createToken(user_id);

          return _insertOrganization(userId);
        })
        .then((organization_id) => {
          organizationId = organization_id;
          return _insertSnapshot(organizationId, userId);
        });
    });

    after(() => {
      return Promise.all([
        knex('users').delete(),
        knex('organizations').delete(),
        knex('snapshots').delete()
      ]);
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
});
