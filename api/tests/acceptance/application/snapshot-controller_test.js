const faker = require('faker');
const bcrypt = require('bcrypt');
const { expect, knex, sinon, generateValidRequestAuhorizationHeader } = require('../../test-helper');
const authorizationToken = require('../../../lib/infrastructure/validators/jsonwebtoken-verify');
const profileService = require('../../../lib/domain/services/profile-service');
const BookshelfUser = require('../../../lib/infrastructure/data/user');
const server = require('../../../server');

describe('Acceptance | Controller | snapshot-controller', () => {

  let userId;
  let organizationId;
  const userPassword = bcrypt.hashSync('A124B2C3#!', 1);

  const fakeUser = new BookshelfUser({
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

  beforeEach(() => {
    return knex('users').insert(inserted_user)
      .then((result) => {
        userId = result.shift();
        inserted_organization['userId'] = userId;
      })
      .then(() => knex('organizations').insert(inserted_organization))
      .then((organization) => organizationId = organization.shift());
  });

  afterEach(() => {
    return knex('users').delete()
      .then(() => {
        return knex('organizations').delete();
      });
  });

  describe('POST /api/snapshots', () => {

    let payload;
    let options;

    beforeEach(() => {
      payload = {
        data: {
          attributes: {
            'student-code': 'Code Etudiant',
            'campaign-code': 'Code Campagne'
          },
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
        payload,
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };

      sinon.stub(authorizationToken, 'verify').resolves(userId);
      sinon.stub(profileService, 'getByUserId').resolves(fakeBuildedProfile);
    });

    afterEach(() => {
      authorizationToken.verify.restore();
      profileService.getByUserId.restore();
    });

    context('When creating with a right payload', () => {

      it('should return 201 HTTP status code', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(201);
          expect(response.result.data.id).to.exist;
        });
      });

      it('should return 201 HTTP status code, even if snapshot code are null', () => {
        // given
        payload.data.attributes['student-code'] = null;
        payload.data.attributes['campaign-code'] = null;

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(201);
          expect(response.result.data.id).to.exist;
        });

      });

    });

    context('when creating with a wrong payload', () => {

      it('should return 422 HTTP status code when organisationId is invalid ', () => {
        // given
        payload.data.relationships.organization.data.id = null;

        // then
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          const parsedResponse = JSON.parse(response.payload);
          expect(parsedResponse.errors[0].detail).to.equal('Cette organisation n’existe pas');
          expect(response.statusCode).to.equal(422);
        });
      });

      it('should return 422 HTTP status code when student code is too long', () => {
        // given
        payload.data.attributes['student-code'] = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec.';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          const parsedResponse = JSON.parse(response.payload);
          expect(parsedResponse.errors[0].detail).to.equal('Les codes de partage du profil sont trop longs');
          expect(response.statusCode).to.equal(422);
        });
      });

      it('should return 422 HTTP status code when campaign code is too long', () => {
        // given
        payload.data.attributes['campaign-code'] = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec.';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          const parsedResponse = JSON.parse(response.payload);
          expect(parsedResponse.errors[0].detail).to.equal('Les codes de partage du profil sont trop longs');
          expect(response.statusCode).to.equal(422);
        });
      });
    });
  });
});
