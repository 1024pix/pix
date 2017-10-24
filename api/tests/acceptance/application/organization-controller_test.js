const { describe, it, after, expect, afterEach, knex } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | organization-controller', function() {

  after(function(done) {
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

            expect(parsedResponse.errors).to.have.length(2);
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
              'completion-percentage': '70',
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
          expect(response.result.data).to.have.length(0);
          expect(response.statusCode).to.equal(200);
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
          name: 'competence-name-1',
          index: '1.1',
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
          name: 'competence-name-2',
          index: '1.2',
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
    completionPercentage: 70,
    userId,
    score: 15,
    profile: JSON.stringify(serializedUserProfile),
    createdAt: '2017-08-31 15:57:06'
  };

  return knex('snapshots')
    .insert(snapshotRaw);
}
