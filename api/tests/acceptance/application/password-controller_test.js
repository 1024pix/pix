const faker = require('faker');
const { expect, knex, sinon } = require('../../test-helper');
const emailService = require('../../../lib/domain/services/mail-service');
const passwordResetService = require('../../../lib/domain/services/password-reset-service');
const  { InvalidTemporaryKeyError } = require('../../../lib/domain/errors');

const createServer = require('../../../server');

describe('Acceptance | Controller | password-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/password-reset-demands', () => {

    let email;

    before(() => {
      email = faker.internet.email().toLowerCase();
      return _insertUser(email);
    });

    after(() => {
      return Promise.all([
        knex('users').delete(),
        knex('password-reset-demands').delete(),
      ]);
    });

    describe('when email provided is unknown', () => {

      it('should reply with 404', async () => {
        const options = {
          method: 'POST',
          url: '/api/password-reset-demands',
          payload: {
            data: {
              attributes: {
                email: 'unknown@unknown.com',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

    });

    describe('when existing email is provided and email is delivered', () => {
      beforeEach(() => {
        sinon.stub(emailService, 'sendPasswordResetDemandEmail').resolves();
      });

      it('should reply with 201', async () => {
        const options = {
          method: 'POST',
          url: '/api/password-reset-demands',
          payload: {
            data: {
              attributes: {
                email,
              },
            },
          },
        };

        // when
        const response = await server.inject(options);
        const createdPasswordResetDemand = response.result.data.attributes;

        // then
        expect(response.statusCode).to.equal(201);
        expect(createdPasswordResetDemand.email).to.equal(email);
        expect(createdPasswordResetDemand['temporary-key']).to.be.a('string');
      });
    });

  });

  describe('POST /api/password-resets', () => {

    let userId;
    const temporaryKey = 'temporaryKey';
    const password = 'pix123456789';

    before(async () => {
      const email = faker.internet.email().toLowerCase();

      userId = await _insertUser(email);
      await _insertPasswordResetDemand(temporaryKey, email);
    });

    after(() => {
      return Promise.all([
        knex('users').delete(),
        knex('password-reset-demands').delete(),
      ]);
    });

    describe('when the temporary key provided is unknown', () => {

      it('should reply with 404', async () => {
        const options = {
          method: 'POST',
          url: '/api/password-resets',
          payload: {
            data: {
              attributes: {
                'temporary-key': 'unknown',
                password,
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    describe('when the password provided is invalid', () => {

      it('should reply with 422', async () => {
        const options = {
          method: 'POST',
          url: '/api/password-resets',
          payload: {
            data: {
              attributes: {
                'temporary-key': temporaryKey,
                password: 'notcontainingadigit',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });

    describe('when the temporary key is known and the password is valid', () => {

      describe('When the temporary key has expired or is already used', () => {

        before(() => {
          sinon.stub(passwordResetService, 'extractUserIdFromTemporaryKey').withArgs(temporaryKey).rejects(new InvalidTemporaryKeyError());
        });

        it('should reply with 401', async () => {
          const options = {
            method: 'POST',
            url: '/api/password-resets',
            payload: {
              data: {
                attributes: {
                  'temporary-key': temporaryKey,
                  password: 'validPassword123',
                },
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });
      });

      describe('when the temporary key is valid', () => {

        before(() => {
          sinon.stub(passwordResetService, 'extractUserIdFromTemporaryKey').withArgs(temporaryKey).resolves(userId);
        });

        it('should reply with 201', async () => {
          const password =  'validPassword123';
          const options = {
            method: 'POST',
            url: '/api/password-resets',
            payload: {
              data: {
                attributes: {
                  'temporary-key': temporaryKey,
                  password,
                },
              },
            },
          };

          // when
          const response = await server.inject(options);
          const createdPasswordReset = response.result.data.attributes;

          // then
          expect(response.statusCode).to.equal(201);
          expect(createdPasswordReset['temporary-key']).to.equal(temporaryKey);
          expect(createdPasswordReset.password).to.equal(password);
        });
      });
    });

  });

});

function _insertUser(email) {
  const userRaw = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email,
    password: 'pix123',
  };

  return knex('users').insert(userRaw).returning('id')
    .then(([id]) => id);
}

function _insertPasswordResetDemand(temporaryKey, email) {
  const resetDemandRaw = { email, temporaryKey, used: false };

  return knex('password-reset-demands').insert(resetDemandRaw);
}
