const { expect, knex, sinon, generateValidRequestAuhorizationHeader } = require('../../test-helper');
const server = require('../../../server');
const mailService = require('../../../lib/domain/services/mail-service');

describe('Acceptance | Controller | follower-controller', () => {

  afterEach(() => {
    return knex('followers').delete();
  });

  describe('POST /api/followers', () => {

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
      // given
      const payload = {
        data: {
          type: 'followers',
          attributes: {
            email: 'shi+1@fu.me'
          }
        }
      };

      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/followers',
        payload,
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      });

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
        expect(response.headers['content-type']).to.contain('application/json');

        const follower = response.result;
        expect(follower.data.id).to.exist;
        expect(follower.data.type).to.equal('followers');
        expect(follower.data.attributes.email).to.equal('shi+1@fu.me');
      });
    });

    it('should return an error with status code 409 if follower already exist', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/followers',
        payload: {
          data: {
            type: 'followers',
            attributes: {
              email: 'shi+1@fu.me'
            }
          }
        },
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };
      const firstRegistration = server.inject(options);

      // when
      const secondRegistration = firstRegistration.then(() => {
        mailServiceStub.reset();
        return server.inject(options);
      });

      // then
      return secondRegistration.then((res) => {
        expect(res.statusCode).to.equal(409);
        expect(mailServiceStub.notCalled).to.be.true;
      });
    });
  });
});
