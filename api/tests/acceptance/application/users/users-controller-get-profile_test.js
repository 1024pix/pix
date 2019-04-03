const { expect, sinon, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const faker = require('faker');
const createServer = require('../../../../server');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const User = require('../../../../lib/infrastructure/data/user');
const profileService = require('../../../../lib/domain/services/profile-service');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Acceptance | Controller | users-controller-get-profile', () => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email();

  let options;
  let server;

  beforeEach(async () => {
    options = {
      method: 'GET',
      url: '/api/users/me/profile',
      payload: {},
      headers: { authorization: generateValidRequestAuhorizationHeader() },
    };
    server = await createServer();
  });

  const expectedSerializedProfile = {
    data: {
      type: 'users',
      id: 1234,
      attributes: {
        'first-name': firstName,
        'last-name': lastName,
        'email': email,
      },
      relationships: {
        competences: {
          data: [
            { type: 'competences', id: 'recCompA' },
            { type: 'competences', id: 'recCompB' }
          ]
        },
        'campaign-participations': {
          links: {
            related: '/api/users/1234/campaign-participations'
          },
        },
        'pix-score': {
          'links': {
            'related': '/api/users/1234/pixscore'
          }
        },
        'scorecards': {
          'links': {
            'related': '/api/users/1234/scorecards'
          }
        },
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
          description: 'description',
          'course-id': 'recBxPAuEPlTgt72q11',
          status: 'notAssessed',
          'assessment-id': null,
          'is-retryable': false,
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
          description: 'description',
          'course-id': 'recBxPAuEPlTgt72q99',
          status: 'notAssessed',
          'assessment-id': null,
          'is-retryable': false,
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
    id: 1234,
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
      description: 'description',
      courseId: 'recBxPAuEPlTgt72q11',
      status: 'notAssessed',
      'assessment-id': null,
      isRetryable: false,
      area: {
        id: 'recAreaA',
        name: 'area-name-1'
      }
    }, {
      id: 'recCompB',
      name: 'competence-name-2',
      index: '1.2',
      areaId: 'recAreaB',
      level: -1,
      description: 'description',
      courseId: 'recBxPAuEPlTgt72q99',
      status: 'notAssessed',
      'assessment-id': null,
      isRetryable: false,
      area: {
        id: 'recAreaB',
        name: 'area-name-2'
      }
    }],
    areas: [{ id: 'recAreaA', name: 'domaine-name-1' }, { id: 'recAreaB', name: 'domaine-name-2' }],
    organizations: []
  };

  describe('GET /api/users/profile', () => {

    describe('Success cases:', () => {

      let profileServiceStub;
      const user = new User({
        id: 1234,
        'first-name': faker.name.firstName(),
        'last-name': faker.name.lastName(),
        email: faker.internet.email(),
        password: 'A124B2C3#!',
        cgu: true
      });

      beforeEach(() => {
        sinon.stub(userRepository, 'findUserById').resolves(user);
        profileServiceStub = sinon.stub(profileService, 'getByUserId');
      });

      it('should response with 200 HTTP status code, when authorization is valid and user is found', () => {
        // given
        profileServiceStub.resolves(fakeBuildedProfile);

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal(expectedSerializedProfile);
        });
      });
    });

    describe('Errors case:', () => {

      beforeEach(() => {
        sinon.stub(userRepository, 'findUserById').resolves();
      });

      it('should response with 401 HTTP status code, when authorization token is not valid', () => {
        // given
        options['headers'] = { authorization: 'INVALID_TOKEN' };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });

      it('should return 404  HTTP status code, when authorization is valid but user not found', async () => {
        // given
        userRepository.findUserById.rejects(new NotFoundError());

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

    });

  });
});
