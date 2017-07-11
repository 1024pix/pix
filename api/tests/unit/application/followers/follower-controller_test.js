const { describe, it, expect, sinon, beforeEach, afterEach } = require('../../../test-helper');
const EmailValidator = require('../../../../lib/domain/services/email-validator');
const Follower = require('../../../../lib/domain/models/data/follower');
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
      // Given
      const follower = { 'email': 'testeur@follower.pix' };
      const emailValidatorStub = sinon.stub(EmailValidator, 'emailIsValid').returns(false);
      sinon.stub(followerSerializer, 'deserialize').callsFake(_ => new Follower(follower));

      // When
      const promise = server.injectThen({ method: 'POST', url: '/api/followers', payload: { 'email': 'INVALID_EMAIL' } });

      // Then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(400);
        emailValidatorStub.restore();
        followerSerializer.deserialize.restore();
      });
    });

    it('should send a welcome email', function() {
      // Given
      const email = faker.internet.email();
      const request = { payload: { data: { attributes: { email } } } };

      // When
      const promise = followerController.save(request, sinon.spy());

      // Then
      return promise.then(() => {
        sinon.assert.calledWith(sendWelcomeEmail, email);
      });
    });

    it('should add the email into a random contact list', function() {
      // Given
      const email = faker.internet.email();
      const request = { payload: { data: { attributes: { email } } } };

      // When
      const promise = followerController.save(request, sinon.spy());

      // Then
      return promise.then(() => {
        sinon.assert.calledWith(addEmailToRandomContactListStub, email);
      });
    });

  });
});
