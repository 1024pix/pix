const faker = require('faker');
const { describe, it, before, after, expect, afterEach, beforeEach, knex, sinon } = require('../../test-helper');
const mailjetService = require('../../../lib/domain/services/mail-service');
const resetPasswordService = require('../../../lib/domain/services/reset-password-service');
const resetPasswordDemandRepository = require('../../../lib/infrastructure/repositories/reset-password-demands-repository');

const server = require('../../../server');

describe('Acceptance | Controller | password-controller', function() {

  after(function(done) {
    server.stop(done);
  });

  describe('POST /api/password-reset-demands', () => {

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
          url: '/api/password-reset-demands',
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
          url: '/api/password-reset-demands',
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
          url: '/api/password-reset-demands',
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

    describe('When temporaryKey is valid and linked to a password reset demand', () => {

      beforeEach(() => {
        fakeUserEmail = faker.internet.email();
      });

      afterEach(() => {
        return Promise.all([knex('users').delete(), knex('reset-password-demands').delete()]);
      });

      it('should reply with 200 status code', async () => {
        // given
        const temporaryKey = resetPasswordService.generateTemporaryKey();
        await _insertUser(fakeUserEmail);
        await _insertPasswordResetDemand(temporaryKey, fakeUserEmail);

        options = {
          method: 'GET',
          url: `/api/password-reset-demands/${temporaryKey}`
        };

        // when
        const promise = server.inject(options);

        // then
        return promise
          .then((response) => {
            expect(response.statusCode).to.equal(200);
          });
      });
    });

  });

  describe('GET /api/password-reset-demands/{temporaryKey}', () => {
    let fakeUserEmail;
    let options;

    describe('When temporaryKey is not valid', () => {

      it('should reply with 401 status code', () => {
        // when
        options = {
          method: 'GET',
          url: '/api/password-reset-demands/invalid-temporary-key'
        };
        return server.inject(options).then((response) => {
          // then
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    describe('When temporaryKey is valid but not linked to a password reset demand', () => {

      it('should reply with 404 status code', () => {
        // when
        const temporaryKey = resetPasswordService.generateTemporaryKey();
        options = {
          method: 'GET',
          url: `/api/password-reset-demands/${temporaryKey}`
        };
        return server.inject(options).then((response) => {
          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });

    describe('When something going wrong', () => {

      beforeEach(() => {
        sinon.stub(resetPasswordService, 'verifyDemand').rejects(new Error());
      });

      afterEach(() => {
        resetPasswordService.verifyDemand.restore();
      });

      it('should reply with 500 status code', () => {
        // when
        const temporaryKey = resetPasswordService.generateTemporaryKey();
        options = {
          method: 'GET',
          url: `/api/password-reset-demands/${temporaryKey}`
        };
        return server.inject(options).then((response) => {
          // then
          expect(response.statusCode).to.equal(500);
        });
      });
    });

    describe('When temporaryKey is valid and linked to a password reset demand', () => {

      const temporaryKey = resetPasswordService.generateTemporaryKey();

      before(() => {
        fakeUserEmail = faker.internet.email();
        _insertUser(fakeUserEmail);
        return _insertPasswordResetDemand(temporaryKey, fakeUserEmail);
      });

      after(() => {
        return Promise.all([knex('users').delete(), knex('reset-password-demands').delete()]);
      });

      it('should reply with 200 status code', () => {
        // when
        options = {
          method: 'GET',
          url: `/api/password-reset-demands/${temporaryKey}`
        };
        return server.inject(options).then((response) => {
          // then
          expect(response.statusCode).to.equal(200);
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

function _insertPasswordResetDemand(temporaryKey, email) {
  const resetDemandRaw = { email, temporaryKey };
  return knex('reset-password-demands').insert(resetDemandRaw);
}
