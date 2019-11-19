const { expect, knex, sinon, databaseBuilder } = require('../../test-helper');
const mailjetService = require('../../../lib/domain/services/mail-service');
const resetPasswordService = require('../../../lib/domain/services/reset-password-service');
const resetPasswordDemandRepository = require('../../../lib/infrastructure/repositories/reset-password-demands-repository');

const createServer = require('../../../server');

describe('Acceptance | Controller | password-controller', () => {

  let server;
  const fakeUserEmail = 'lebolossdu66@hotmail.com';

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/password-reset-demands', () => {
    let options;

    beforeEach(() => {
      databaseBuilder.factory.buildUser({ email: fakeUserEmail });
      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('reset-password-demands').delete();
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
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
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

      it('should reply with 201', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
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

      it('should reply with 500', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(500);
        });
      });
    });

    describe('When temporaryKey is valid and linked to a password reset demand', () => {

      it('should reply with 200 status code', async () => {
        // given
        const temporaryKey = resetPasswordService.generateTemporaryKey();
        await _insertPasswordResetDemand(temporaryKey, fakeUserEmail);

        options = {
          method: 'GET',
          url: `/api/password-reset-demands/${temporaryKey}`
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });
    });

  });

  describe('GET /api/password-reset-demands/{temporaryKey}', () => {
    let options;

    describe('When temporaryKey is not valid', () => {

      it('should reply with 401 status code', () => {
        // given
        options = {
          method: 'GET',
          url: '/api/password-reset-demands/invalid-temporary-key'
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    describe('When temporaryKey is valid but not linked to a password reset demand', () => {

      it('should reply with 404 status code', () => {
        // given
        const temporaryKey = resetPasswordService.generateTemporaryKey();
        options = {
          method: 'GET',
          url: `/api/password-reset-demands/${temporaryKey}`
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(404);
        });
      });
    });

    describe('When something going wrong', () => {

      beforeEach(() => {
        sinon.stub(resetPasswordService, 'verifyDemand').rejects(new Error());
      });

      it('should reply with 500 status code', () => {
        // given
        const temporaryKey = resetPasswordService.generateTemporaryKey();
        options = {
          method: 'GET',
          url: `/api/password-reset-demands/${temporaryKey}`
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(500);
        });
      });
    });

    describe('When temporaryKey is valid and linked to a password reset demand', () => {
      let temporaryKey;

      beforeEach(async () => {
        temporaryKey = resetPasswordService.generateTemporaryKey();
        databaseBuilder.factory.buildUser({ email: fakeUserEmail });
        await databaseBuilder.commit();
        await _insertPasswordResetDemand(temporaryKey, fakeUserEmail);
      });

      afterEach(() => {
        return knex('reset-password-demands').delete();
      });

      it('should reply with 200 status code', () => {
        // given
        options = {
          method: 'GET',
          url: `/api/password-reset-demands/${temporaryKey}`
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });
    });

  });
});

function _insertPasswordResetDemand(temporaryKey, email) {
  const resetDemandRaw = { email, temporaryKey };
  return knex('reset-password-demands').insert(resetDemandRaw);
}
