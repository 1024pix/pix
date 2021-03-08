const pick = require('lodash/pick');

const {
  domainBuilder,
  expect,
  knex,
  nock,
} = require('../../../test-helper');

const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(async () => {
    await knex('authentication-methods').delete();
    await knex('users_pix_roles').delete();
    await knex('sessions').delete();
    await knex('users').delete();
  });

  describe('save', () => {

    const options = {
      method: 'POST',
      url: '/api/users',
      payload: {
        data: {
          type: 'users',
          attributes: {
            'password': 'Password123',
            'cgu': true,
            'recaptcha-token': 'reCAPTCHAToken',
          },
          relationships: {},
        },
      },
    };

    let user;

    context('user is valid', () => {

      beforeEach(() => {

        nock('https://www.google.com')
          .post('/recaptcha/api/siteverify')
          .query(true)
          .reply(200, {
            'success': true,
          });

        user = domainBuilder.buildUser({ username: null });

        options.payload.data.attributes = {
          ...options.payload.data.attributes,
          'first-name': user.firstName,
          'last-name': user.lastName,
          email: user.email,
        };
      });

      afterEach(async () => {
        nock.cleanAll();
      });

      it('should return status 201 with user', async () => {
        // given
        const pickedUserAttributes = ['first-name', 'last-name', 'email', 'username', 'cgu'];
        const expectedAttributes = {
          'first-name': user.firstName,
          'last-name': user.lastName,
          email: user.email,
          username: user.username,
          cgu: user.cgu,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.type).to.equal('users');
        expect(response.result.data.attributes['recaptcha-token']).to.be.undefined;

        const userAttributes = pick(response.result.data.attributes, pickedUserAttributes);
        expect(userAttributes).to.deep.equal(expectedAttributes);
      });

      it('should create user in Database', async () => {
        // given
        const pickedUserAttributes = ['firstName', 'lastName', 'email', 'username', 'cgu'];
        const expectedUser = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          cgu: user.cgu,
        };

        // when
        await server.inject(options);

        // then
        const userFound = await userRepository.getByUsernameOrEmailWithRolesAndPassword(user.email);
        expect(pick(userFound, pickedUserAttributes)).to.deep.equal(expectedUser);
        expect(userFound.authenticationMethods[0].authenticationComplement.password).to.exist;
      });

    });

    context('user is invalid', async () => {

      const validUserAttributes = {
        'first-name': 'John',
        'last-name': 'DoDoe',
        'email': 'john.doe@example.net',
        'password': 'Ab124B2C3#!',
        'cgu': true,
        'recaptcha-token': 'reCAPTCHAToken',
      };

      it('should return Unprocessable Entity (HTTP_422) with offending properties', async () => {

        const invalidUserAttributes = { ...validUserAttributes, 'must-validate-terms-of-service': 'not_a_boolean' };

        const options = {
          method: 'POST',
          url: '/api/users',
          payload: {
            data: {
              type: 'users',
              attributes: invalidUserAttributes,
              relationships: {},
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
        expect(response.result.errors[0].title).to.equal('Invalid data attribute "mustValidateTermsOfService"');
      });
    });
  });
});
