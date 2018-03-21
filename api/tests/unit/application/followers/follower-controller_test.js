const { expect, sinon } = require('../../../test-helper');
const EmailValidator = require('../../../../lib/domain/services/email-validator');
const Follower = require('../../../../lib/infrastructure/data/follower');
const followerSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/follower-serializer');

const followerController = require('../../../../lib/application/followers/follower-controller');
const mailService = require('../../../../lib/domain/services/mail-service');

const faker = require('faker');
const server = require('../../../../server');

describe('Unit | Controller | FollowerController', function() {

  describe('#save', function() {

    let sendWelcomeEmail;
    let addEmailToRandomContactListStub;

    beforeEach(() => {
      sendWelcomeEmail = sinon.stub(mailService, 'sendWelcomeEmail');
      addEmailToRandomContactListStub = sinon.stub(mailService, 'addEmailToRandomContactList');
    });

    afterEach(() => {
      sendWelcomeEmail.restore();
      addEmailToRandomContactListStub.restore();
    });

    it('should return 400 status code when email provided is not valid', function() {
      // given
      const follower = { 'email': 'testeur@follower.pix' };
      const emailValidatorStub = sinon.stub(EmailValidator, 'emailIsValid').returns(false);
      sinon.stub(followerSerializer, 'deserialize').callsFake(_ => new Follower(follower));

      // when
      const promise = server.inject({ method: 'POST', url: '/api/followers', payload: { 'email': 'INVALID_EMAIL' } });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(400);
        emailValidatorStub.restore();
        followerSerializer.deserialize.restore();
      });
    });

    it('should send a welcome email', function() {
      // given
      const email = faker.internet.email().toLowerCase();
      const request = { payload: { data: { attributes: { email } } } };

      // when
      const promise = followerController.save(request, sinon.spy());

      // then
      return promise.then(() => {
        sinon.assert.calledWith(sendWelcomeEmail, email);
      });
    });

    it('should add the email into a random contact list', function() {
      // given
      const email = faker.internet.email().toLowerCase();
      const request = { payload: { data: { attributes: { email } } } };

      // when
      const promise = followerController.save(request, sinon.spy());

      // then
      return promise.then(() => {
        sinon.assert.calledWith(addEmailToRandomContactListStub, email);
      });
    });

  });
});
