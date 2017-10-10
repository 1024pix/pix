const faker = require('faker');
const { describe, it, before, after, expect, afterEach, beforeEach, knex, sinon } = require('../../test-helper');
const mailjetService = require('../../../lib/domain/services/mail-service');
const resetPasswordDemandRepository = require('../../../lib/infrastructure/repositories/reset-password-demands-repository');

const server = require('../../../server');

describe('Acceptance | Controller | password-controller', function() {

  after(function(done) {
    server.stop(done);
  });

  describe('POST /api/password-resets', () => {

    let fakeUserEmail;
    let options;

    before(() => {
      fakeUserEmail = faker.internet.email();
      _insertUser(fakeUserEmail);
    });

    after(() => {
      return Promise.all([knex('users').delete(), knex('reset-password-demands').delete()]);
    });

    describe('when email provided is unknown', () => {
      beforeEach(() => {
        options = {
          method: 'POST',
          url: '/api/password-resets',
          payload: {
            data: {
              attributes: {
                email: 'uzinagaz@unknown.xh'
              }
            }
          }
        };
      });

      it('should reply with 404', () => {
        // when
        return server.inject(options).then((response) => {
          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });

    describe('when existing email is provided and email is delivered', () => {
      beforeEach(() => {
        options = {
          method: 'POST',
          url: '/api/password-resets',
          payload: {
            data: {
              attributes: {
                email: fakeUserEmail
              }
            }
          }
        };

        sinon.stub(mailjetService, 'sendResetPasswordDemandEmail').resolves();
      });

      afterEach(() => {
        mailjetService.sendResetPasswordDemandEmail.restore();
      });

      it('should reply with 201', () => {
        // when
        return server.inject(options).then((response) => {
          // then
          expect(response.statusCode).to.equal(201);
        });
      });
    });

    describe('when existing email is provided, but some internal error has occured', () => {
      beforeEach(() => {
        options = {
          method: 'POST',
          url: '/api/password-resets',
          payload: {
            data: {
              attributes: {
                email: fakeUserEmail
              }
            }
          }
        };

        sinon.stub(resetPasswordDemandRepository, 'create').rejects(new Error());
      });

      afterEach(() => {
        resetPasswordDemandRepository.create.restore();
      });

      it('should reply with 500', () => {
        // when
        return server.inject(options).then((response) => {
          // then
          expect(response.statusCode).to.equal(500);
        });
      });
    });

  });
});

function _insertUser(email) {
  const userRaw = {
    'firstName': faker.name.firstName(),
    'lastName': faker.name.lastName(),
    email,
    password: 'Pix2017!'
  };

  return knex('users').insert(userRaw)
    .then(user => user.shift());
}
