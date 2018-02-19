const { expect, sinon } = require('../../test-helper');
const faker = require('faker');
const server = require('../../../server');
const authorizationToken = require('../../../lib/infrastructure/validators/jsonwebtoken-verify');
const UserRepository = require('../../../lib/infrastructure/repositories/user-repository');
const User = require('../../../lib/infrastructure/data/user');
const Bookshelf = require('../../../lib/infrastructure/bookshelf');
const profileService = require('../../../lib/domain/services/profile-service');
const { InvalidTokenError } = require('../../../lib/domain/errors');

const expectedResultWhenInvalidToken = {
  errors: [{
    status: '400',
    title: 'Invalid Attribute',
    detail: 'Le token n’est pas valide',
    source: { 'pointer': '/data/attributes/authorization' },
    meta: { 'field': 'authorization' }
  }]
};

const expectedResultUserNotFounded = {
  errors: [{
    status: '400',
    title: 'Invalid Attribute',
    detail: 'Cet utilisateur est introuvable',
    source: { 'pointer': '/data/attributes/authorization' },
    meta: { 'field': 'authorization' }
  }]
};

const expectedResultWhenErrorOccured = {
  errors: [{
    status: '400',
    title: 'Invalid Attribute',
    detail: 'Une erreur est survenue lors de l’authentification de l’utilisateur',
    source: { 'pointer': '/data/attributes/authorization' },
    meta: { 'field': 'authorization' }
  }]
};

describe('Acceptance | Controller | users-controller-get-profile', function() {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email();
  const options = {
    method: 'GET',
    url: '/api/users/me',
    payload: {}
  };
  const expectedSerializedProfile = {
    data: {
      type: 'users',
      id: 'user_id',
      attributes: {
        'first-name': firstName,
        'last-name': lastName,
        'email': email
      },
      relationships: {
        competences: {
          data: [
            { type: 'competences', id: 'recCompA' },
            { type: 'competences', id: 'recCompB' }
          ]
        }
      }
    },
    included: [
      {
        type: 'areas',
        id: 'recAreaA',
        attributes: {
          name: 'domaine-name-1'
        }
      },
      {
        type: 'areas',
        id: 'recAreaB',
        attributes: {
          name: 'domaine-name-2'
        }
      },
      {
        type: 'competences',
        id: 'recCompA',
        attributes: {
          name: 'competence-name-1',
          index: '1.1',
          level: -1,
          'course-id': 'recBxPAuEPlTgt72q11',
          status: 'notEvaluated',
          'assessment-id': null,
        },
        relationships: {
          area: {
            data: {
              type: 'areas',
              id: 'recAreaA',
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
          level: -1,
          'course-id': 'recBxPAuEPlTgt72q99',
          status: 'notEvaluated',
          'assessment-id': null,
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
  const fakeUser = new User({
    id: 'user_id',
    'firstName': firstName,
    'lastName': lastName,
    'email': email
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
      status: 'notEvaluated',
      'assessment-id': null,
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
      status: 'notEvaluated',
      'assessment-id': null,
      area: {
        id: 'recAreaB',
        name: 'area-name-2'
      }
    }],
    areas: [{ id: 'recAreaA', name: 'domaine-name-1' }, { id: 'recAreaB', name: 'domaine-name-2' }],
    organizations: []
  };

  describe('GET /users', function() {

    describe('Errors case:', () => {

      beforeEach(() => {
        sinon.stub(authorizationToken, 'verify').resolves(4);
        sinon.stub(UserRepository, 'findUserById').resolves();
      });

      afterEach(() => {
        authorizationToken.verify.restore();
        UserRepository.findUserById.restore();
      });

      it('should response with 401 HTTP status code, when authorization token is not valid', (done) => {
        // given
        authorizationToken.verify.returns(Promise.reject(new InvalidTokenError()));
        options['headers'] = { authorization: 'INVALID_TOKEN' };

        // when
        server.injectThen(options).then(response => {
          // then
          expect(response.statusCode).to.equal(401);
          expect(response.result).to.be.deep.equal(expectedResultWhenInvalidToken);
          done();
        });
      });

      it('should return 404  HTTP status code, when authorization is valid but user not found', () => {
        // given
        authorizationToken.verify.resolves(4);
        UserRepository.findUserById.returns(Promise.reject(new Bookshelf.Model.NotFoundError()));
        options['headers'] = { authorization: 'Bearer VALID_TOKEN' };

        // when
        return server.injectThen(options).then(response => {
          // Then
          expect(response.statusCode).to.equal(404);
          expect(response.result).to.deep.equal(expectedResultUserNotFounded);
        });
      });

      it('should return 500  HTTP status code, when authorization is valid but error occurred', () => {
        // given
        authorizationToken.verify.resolves(4);
        UserRepository.findUserById.returns(Promise.reject(new Error()));
        options['headers'] = { authorization: 'Bearer VALID_TOKEN' };

        // when
        return server.injectThen(options).then(response => {
          // then
          expect(response.statusCode).to.equal(500);
          expect(response.result).to.deep.equal(expectedResultWhenErrorOccured);
        });
      });

    });

    describe('Success cases:', function() {

      let profileServiceStub;
      let authorizationTokenStub;
      let UserRepositoryStub;
      const user = new User({
        id: 'user_id',
        'first-name': faker.name.firstName(),
        'last-name': faker.name.lastName(),
        email: faker.internet.email(),
        password: 'A124B2C3#!',
        cgu: true
      });

      beforeEach(() => {
        authorizationTokenStub = sinon.stub(authorizationToken, 'verify').resolves(1);
        UserRepositoryStub = sinon.stub(UserRepository, 'findUserById').resolves(user);
        profileServiceStub = sinon.stub(profileService, 'getByUserId');
      });

      afterEach(() => {
        profileServiceStub.restore();
        authorizationTokenStub.restore();
        UserRepositoryStub.restore();
      });

      it('should response with 201 HTTP status code, when authorization is valid and user is found', () => {
        // Given
        profileServiceStub.resolves(fakeBuildedProfile);
        options['headers'] = { authorization: 'Bearer VALID_TOKEN' };

        // When
        return server.injectThen(options).then(response => {
          // Then
          expect(response.statusCode).to.be.equal(201);
          expect(response.result).to.be.deep.equal(expectedSerializedProfile);
        });
      });
    });
  });
})
;
