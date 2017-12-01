const { describe, it, beforeEach, afterEach, expect, knex, sinon } = require('../../test-helper');
const server = require('../../../server');
const mailService = require('../../../lib/domain/services/mail-service');

describe('Acceptance | Controller | follower-controller', () => {

  beforeEach((done) => {
    knex('followers').delete().then(() => done());
  });

  afterEach((done) => {
    knex('followers').delete().then(() => done());
  });

  describe('POST /api/followers', function() {

    let mailServiceStub;
    let addEmailToRandomContactListStub;

    beforeEach(() => {
      mailServiceStub = sinon.stub(mailService, 'sendWelcomeEmail');
      addEmailToRandomContactListStub = sinon.stub(mailService, 'addEmailToRandomContactList');
    });

    afterEach(() => {
      mailServiceStub.restore();
      addEmailToRandomContactListStub.restore();
    });

    it('should persist the follower if follower does not exist', () => {
      const payload = {
        data: {
          type: 'followers',
          attributes: {
            email: 'shi+1@fu.me'
          }
        }
      };

      // When
      const promise = server.injectThen({ method: 'POST', url: '/api/followers', payload });

      // Then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
        expect(response.headers['content-type']).to.contain('application/json');

        const follower = response.result;
        expect(follower.data.id).to.exist;
        expect(follower.data.type).to.equal('followers');
        expect(follower.data.attributes.email).to.equal('shi+1@fu.me');
      });
    });

    it('should return an error with status code 409 if follower already exist', function() {
      const payload = {
        data: {
          type: 'followers',
          attributes: {
            email: 'shi+1@fu.me'
          }
        }
      };

      const firstRegistration = server.injectThen({ method: 'POST', url: '/api/followers', payload });

      // When
      const secondRegistration = firstRegistration.then(_ => {
        mailServiceStub.reset();
        return server.inject({ method: 'POST', url: '/api/followers', payload });
      });

      // Then
      return secondRegistration.then((res) => {
        expect(res.statusCode).to.equal(409);
        expect(mailServiceStub.notCalled).to.be.true;
      });

    });
  });
});
