const pick = require('lodash/pick');

const { domainBuilder, expect, knex, nock } = require('../../../test-helper');

const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  afterEach(async function () {
    await knex('authentication-methods').delete();
    await knex('pix-admin-roles').delete();
    await knex('sessions').delete();
    await knex('users').delete();
  });

  describe('save', function () {
    const options = {
      method: 'POST',
      url: '/api/users',
      payload: {
        data: {
          type: 'users',
          attributes: {
            password: 'Password123',
            cgu: true,
          },
          relationships: {},
        },
      },
    };

    let user;

    context('user is valid', function () {
      beforeEach(function () {
        nock('https://www.google.com').post('/recaptcha/api/siteverify').query(true).reply(200, {
          success: true,
        });

        user = domainBuilder.buildUser({ username: null });

        options.payload.data.attributes = {
          ...options.payload.data.attributes,
          'first-name': user.firstName,
          'last-name': user.lastName,
          email: user.email,
        };
      });

      afterEach(async function () {
        nock.cleanAll();
      });

      it('should return status 201 with user', async function () {
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
        expect(response.result.data.attributes['last-terms-of-service-validated-at']).to.be.instanceOf(Date);
        const userAttributes = pick(response.result.data.attributes, pickedUserAttributes);
        expect(userAttributes).to.deep.equal(expectedAttributes);
      });

      it('should create user in Database', async function () {
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

    context('when a "locale" cookie is present', function () {
      it('creates a user with a locale in database', async function () {
        // given
        const localeFromCookie = 'fr';
        const userAttributes = {
          'first-name': 'John',
          'last-name': 'DoDoe',
          email: 'john.dodoe@example.net',
          cgu: true,
          password: 'Password123',
        };

        const options = {
          method: 'POST',
          url: '/api/users',
          headers: {
            cookie: `locale=${localeFromCookie}`,
          },
          payload: {
            data: {
              type: 'users',
              attributes: userAttributes,
              relationships: {},
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const createdUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(userAttributes.email);
        expect(createdUser.locale).to.equal(localeFromCookie);
        expect(response.statusCode).to.equal(201);
      });
    });

    context('user is invalid', function () {
      const validUserAttributes = {
        'first-name': 'John',
        'last-name': 'DoDoe',
        email: 'john.doe@example.net',
        password: 'Ab124B2C3#!',
        cgu: true,
      };

      it('should return Unprocessable Entity (HTTP_422) with offending properties', async function () {
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
