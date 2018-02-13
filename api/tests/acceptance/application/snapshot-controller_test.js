const faker = require('faker');
const bcrypt = require('bcrypt');
const { describe, it, after, before, expect, afterEach, beforeEach, knex, sinon } = require('../../test-helper');
const authorizationToken = require('../../../lib/infrastructure/validators/jsonwebtoken-verify');
const profileService = require('../../../lib/domain/services/profile-service');
const User = require('../../../lib/infrastructure/data/user');
const server = require('../../../server');

describe('Acceptance | Controller | snapshot-controller', function() {

  let userId;
  let organizationId;
  const userPassword = bcrypt.hashSync('A124B2C3#!', 1);

  const fakeUser = new User({
    id: 'user_id',
    'firstName': faker.name.firstName(),
    'lastName': faker.name.lastName(),
    'email': faker.internet.email()
  });

  const fakeBuildedProfile = {
    user: fakeUser,
    competences: [{
      id: 'recCompA',
      name: 'competence-name-1',
      index: '1.1',
      areaId: 'recAreaA',
      level: -1,
      courseId: 'recBxPAuEPlTgt72q11',
      area: {
        id: 'recAreaA',
        name: 'area-name-1'
      }
    },
    {
      id: 'recCompB',
      name: 'competence-name-2',
      index: '1.2',
      areaId: 'recAreaB',
      level: -1,
      courseId: 'recBxPAuEPlTgt72q99',
      area: {
        id: 'recAreaB',
        name: 'area-name-2'
      }

    }],
    areas: [{ id: 'recAreaA', name: 'domaine-name-1' }, { id: 'recAreaB', name: 'domaine-name-2' }],
    organizations: []
  };

  const inserted_user = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: userPassword,
    cgu: true
  };

  const inserted_organization = {
    name: 'The name of the organization',
    email: 'organization@email.com',
    type: 'PRO'
  };

  before(() => {
    return knex.migrate.latest()
      .then(() => knex.seed.run())
      .then(() => knex('users').insert(inserted_user))
      .then((result) => {
        userId = result.shift();
        inserted_organization['userId'] = userId;
        return knex('organizations').insert(inserted_organization);
      }).then((organization) => {
        organizationId = organization.shift();
      });
  });

  after(function(done) {
    server.stop(done);
  });

  describe('POST /api/snapshots', function() {

    let payload;
    let options;
    let injectPromise;

    beforeEach(() => {
      payload = {
        data: {
          relationships: {
            organization: {
              data: {
                id: organizationId
              }
            }
          }
        }
      };

      options = {
        method: 'POST',
        url: '/api/snapshots',
        payload
      };

      options['headers'] = { authorization: 'VALID_TOKEN' };
      sinon.stub(authorizationToken, 'verify').resolves(userId);
      sinon.stub(profileService, 'getByUserId').resolves(fakeBuildedProfile);
      injectPromise = server.inject(options);
    });

    afterEach(() => {
      authorizationToken.verify.restore();
      profileService.getByUserId.restore();
      return knex('snapshots').delete();
    });

    it('should return 201 HTTP status code', () => {
      // When
      return injectPromise.then((response) => {
        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.id).to.exist;
      });
    });

    context('when creating with a wrong payload', () => {

      it('should return 422 HTTP status code', () => {
        // Given
        payload.data.relationships.organization.data.id = null;

        // Then
        const creatingSnapshotWithWrongParams = server.inject(options);

        // Then
        return creatingSnapshotWithWrongParams.then((response) => {
          const parsedResponse = JSON.parse(response.payload);
          expect(parsedResponse.errors[0].detail).to.equal('Cette organisation n’existe pas');
          expect(response.statusCode).to.equal(422);
        });
      });

    });
  });
});
