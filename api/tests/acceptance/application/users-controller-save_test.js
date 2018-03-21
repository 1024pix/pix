const { expect, sinon } = require('../../test-helper');
const faker = require('faker');

const server = require('../../../server');
const User = require('../../../lib/infrastructure/data/user');

const mailService = require('../../../lib/domain/services/mail-service');
const logger = require('../../../lib/infrastructure/logger');
const gRecaptcha = require('../../../lib/infrastructure/validators/grecaptcha-validator');

describe('Acceptance | Controller | users-controller', () => {

  let options;
  let attributes;
  let sendAccountCreationEmailStub;
  let loggerStub;
  let recaptchaVerifyStub;

  before(() => {
    sendAccountCreationEmailStub = sinon.stub(mailService, 'sendAccountCreationEmail');
    loggerStub = sinon.stub(logger, 'error').returns({});
    recaptchaVerifyStub = sinon.stub(gRecaptcha, 'verify').resolves();
  });

  beforeEach(() => {
    attributes = {
      'first-name': faker.name.firstName(),
      'last-name': faker.name.lastName(),
      email: faker.internet.email().toLowerCase(),
      password: 'A124B2C3#!',
      cgu: true
    };

    options = {
      method: 'POST',
      url: '/api/users',
      payload: {
        data: {
          type: 'user',
          attributes,
          relationships: {}
        }
      }
    };
  });

  after(() => {
    sendAccountCreationEmailStub.restore();
    loggerStub.restore();
    recaptchaVerifyStub.restore();
  });

  it('should return 201 HTTP status code', () => {
    // when
    const promise = server.inject(options);

    // then
    return promise.then((response) => {
      expect(response.statusCode).to.equal(201);
    });
  });

  it('should return 400 HTTP status code when no payload', () => {
    // given
    options.payload = {};

    // when
    const promise = server.inject(options);

    // then
    return promise.then((response) => {
      expect(response.statusCode).to.equal(400);
    });
  });

  it('should return 422 HTTP status code when email already exists', () => {
    // given
    const firstRegistration = server.inject(options);

    // when
    const secondRegistration = firstRegistration.then(_ => {
      return server.inject(options);
    });

    // then
    return secondRegistration.then((response) => {
      expect(response.statusCode).to.equal(422);
    });
  });

  it('should save the user in the database', () => {
    // when
    const promise = server.inject(options);

    // then
    return promise.then(() => {
      return new User({ email: attributes.email }).fetch()
        .then(user => {
          expect(attributes['first-name']).to.equal(user.get('firstName'));
          expect(attributes['last-name']).to.equal(user.get('lastName'));
        });
    });
  });

  it('should crypt user password', () => {
    // given
    options.payload.data.attributes.password = 'my-123-password';

    // when
    const promise = server.inject(options);

    // then
    return promise.then(() => {
      return new User({ email: attributes.email }).fetch()
        .then((user) => {
          expect(user.get('password')).not.to.equal('my-123-password');
        });
    });
  });

  describe('should return 422 HTTP status code', () => {
    it('when the email is not valid', () => {
      // given
      options.payload.data.attributes.email = 'invalid.email@';

      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        expect(response.statusCode).to.equal(422);
      });
    });

  });

});
