const {describe, it, expect, before, sinon, after} = require('../../../test-helper');
const _ = require('lodash');
const Hapi = require('hapi');
const EmailValidator = require('../../../../lib/domain/services/email-validator');
const Follower = require('../../../../lib/domain/models/data/follower');
const followerSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/follower-serializer');
const Mailjet = require('../../../../lib/infrastructure/mailjet')

describe('Unit | Controller | FollowerController', function () {

  let server;

  before(function () {
    server = this.server = new Hapi.Server();
    server.connection({port: null});
    server.register({register: require('../../../../lib/application/followers')});
  });

  describe('#save', function () {
    it('should return 400 status code when email provided is not valid', function (done) {
      //Given
      const follower = {"email": "testeur@follower.pix"};
      const emailValidatorStub = sinon.stub(EmailValidator, 'emailIsValid').returns(false);
      sinon.stub(followerSerializer, 'deserialize', _ => new Follower(follower));

      const spyMailjet = sinon.spy(Mailjet, 'sendWelcomeEmail');
      // when
      server.inject({method: 'POST', url: '/api/followers', payload: {"email": 'INVALID_EMAIL'}},
        (res) => {
          // then
          expect(res.statusCode).to.equal(400);
          expect(spyMailjet.calledOnce).to.be.false;
          emailValidatorStub.restore();
          followerSerializer.deserialize.restore();
          spyMailjet.restore();
          done();
        });
    });
  });
});
