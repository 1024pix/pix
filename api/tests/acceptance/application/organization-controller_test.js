const jwt = require('jsonwebtoken');
const { expect, knex, nock } = require('../../test-helper');
const server = require('../../../server');
const settings = require('../../../lib/settings');

describe('Acceptance | Controller | organization-controller', function() {

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

  after((done) => {
    nock.cleanAll();
    server.stop(done);
  });

  describe('POST /api/organizations', function() {
    const payload = {
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
    const options = {
      method: 'POST', url: '/api/organizations', payload
    };

    afterEach(() => {
      return knex('users').delete()
        .then(() => {
          return knex('organizations').delete();
        });
    });

    it('should return 200 HTTP status code', () => {
      return server.inject(options).then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return 400 HTTP status code when creating two organizations with the same email', () => {
      // Given
      const createFirstOrganization = server.inject(options);

      // Then
      const secondOrganizationOnFailure = createFirstOrganization.then(() => {
        return server.inject(options);
      });

      // Then
      return secondOrganizationOnFailure.then((response) => {
        const parsedResponse = JSON.parse(response.payload);
        expect(parsedResponse.errors[0].detail).to.equal('L\'adresse organization@email.com est déjà associée à un utilisateur.');
        expect(response.statusCode).to.equal(400);
      });
    });

    describe('when creating with a wrong payload', () => {
      it('should return 400 HTTP status code', () => {
        // Given
        payload.data.attributes.type = 'FAK';

        // Then
        const creatingOrganizationOnFailure = server.inject(options);

        // Then
        return creatingOrganizationOnFailure.then((response) => {
          const parsedResponse = JSON.parse(response.payload);
          expect(parsedResponse.errors[0].detail).to.equal('Le type d\'organisation doit être l\'une des valeurs suivantes: SCO, SUP, PRO.');
          expect(response.statusCode).to.equal(400);
        });
      });

      it('should return both User and Organization errors at the same time', () => {
        // Given
        payload.data.attributes.type = 'FAK';
        payload.data.attributes.password = 'invalid-password';

        // Then
        const creatingOrganizationOnFailure = server.inject(options);

        // Then
        return creatingOrganizationOnFailure
          .then((response) => {
            const parsedResponse = JSON.parse(response.payload);

            expect(parsedResponse.errors).to.have.lengthOf(2);
            expect(parsedResponse.errors[1].detail).to.equal('Le type d\'organisation doit être l\'une des valeurs suivantes: SCO, SUP, PRO.');
            expect(parsedResponse.errors[0].detail).to.equal('Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.');
          });
      });

      it('should not keep the user in the database', () => {
        // Given
        payload.data.attributes.type = 'FAK';

        // Then
        const creatingOrganizationOnFailure = server.inject(options);

        // Then
        return creatingOrganizationOnFailure
          .then(() => {
            return knex('users').count('id as id').then((count) => {
              expect(count[0].id).to.equal(0);
            });
          });
      });

    });
  });

  describe('GET /api/organizations/{id}/snapshots', () => {
    const payload = {};
    let organizationId;
    let userId;
    let snapshotId;

    before((done) => {
      _insertUser()
        .then((user_id) => {
          userId = user_id;
          return _insertOrganization(userId);
        })
        .then((organization_id) => {
          organizationId = organization_id;
          return _insertSnapshot(organizationId, userId);
        })
        .then((snapshot_id) => {
          snapshotId = snapshot_id;
        })
        .then(() => done());
    });

    after(() => {
      return Promise.all([knex('users').delete(), knex('organizations').delete(), knex('snapshots').delete()]);
    });

    it('should return 200 HTTP status code', () => {
      // given
      const url = `/api/organizations/${organizationId}/snapshots`;
      const expectedSnapshots = {
        data:
          [{
            type: 'snapshots',
            id: snapshotId.toString(),
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
        method: 'GET', url, payload
      };

      // when
      return server.injectThen(options).then((response) => {
        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedSnapshots);
      });
    });

    it('should return 200, when no snapshot was found', () => {
      // given
      const options = {
        method: 'GET', url: '/api/organizations/unknownId/snapshots', payload: {}
      };

      // when
      return server
        .injectThen(options)
        .then((response) => {
          // then
          expect(response.result.data).to.have.lengthOf(0);
          expect(response.statusCode).to.equal(200);
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
        knex('snapshots').delete()]);
    });

    it('should return 200 HTTP status code', () => {
      // given
      const url = `/api/organizations/${organizationId}/snapshots/export?userToken=${userToken}`;
      const expectedCsvSnapshots = '\uFEFF"Nom";"Prénom";"Numéro Étudiant";"Code Campagne";"Date";"Score Pix";' +
        '"Tests Réalisés";"Traiter des données";"Protéger les données personnelles et la vie privée"\n' +
        '"Doe";"john";"";"";31/08/2017;15;="1/2";;8\n';

      const request = {
        method: 'GET', url, payload
      };

      // when
      return server.injectThen(request).then((response) => {
        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedCsvSnapshots);
      });
    });
  });
});

function _insertOrganization(userId) {
  const organizationRaw = {
    name: 'The name of the organization',
    email: 'organization@email.com',
    type: 'SUP',
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
    email: 'john.Doe@internet.fr',
  }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });
}
