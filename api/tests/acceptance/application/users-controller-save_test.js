const { expect, sinon, knex } = require('../../test-helper');
const faker = require('faker');

const server = require('../../../server');
const BookshelfUser = require('../../../lib/infrastructure/data/user');

const mailService = require('../../../lib/domain/services/mail-service');
const logger = require('../../../lib/infrastructure/logger');
const gRecaptcha = require('../../../lib/infrastructure/validators/grecaptcha-validator');

describe('Acceptance | Controller | users-controller', function() {

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

  beforeEach(function() {
    attributes = {
      'first-name': faker.name.firstName(),
      'last-name': faker.name.lastName(),
      email: 'fake-email@address.com',
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

  afterEach(() => {
    return knex('users').delete();
  });

  after(function() {
    sendAccountCreationEmailStub.restore();
    loggerStub.restore();
    recaptchaVerifyStub.restore();
  });

  it('should return 201 HTTP status code', function() {
    return server.injectThen(options).then(response => {
      expect(response.statusCode).to.equal(201);
    });
  });

  it('should return 400 HTTP status code when no payload', function() {
    // Given
    options.payload = {};

    // When
    return server.injectThen(options).then(response => {
      expect(response.statusCode).to.equal(400);
    });
  });

  it('should return 422 HTTP status code when email already exists', function() {
    // Given
    const firstRegistration = server.injectThen(options);

    // When
    const secondRegistration = firstRegistration.then(_ => {
      return server.injectThen(options);
    });

    // Then
    return secondRegistration.then((response) => {
      expect(response.statusCode).to.equal(422);
    });
  });

  it('should save the user in the database', function() {
    return server
      .injectThen(options)
      .then(_ => {
        return new BookshelfUser({ email: attributes.email }).fetch();
      })
      .then((user) => {
        expect(attributes['first-name']).to.equal(user.get('firstName'));
        expect(attributes['last-name']).to.equal(user.get('lastName'));
        expect(attributes['email']).to.equal(user.get('email'));
      });
  });

  it('should crypt user password', function() {
    // Given
    options.payload.data.attributes.password = 'my-123-password';

    return server.injectThen(options).then(() => {
      return new BookshelfUser({ email: attributes.email }).fetch();
    }).then((user) => {
      expect(user.get('password')).not.to.equal('my-123-password');
    });
  });

  describe('should return 422 HTTP status code', () => {
    it('when the email is not valid', function() {
      // Given
      options.payload.data.attributes.email = 'invalid.email@';

      // When
      const promise = server.injectThen(options);

      // Then
      return promise.then(response => {
        expect(response.statusCode).to.equal(422);
      });
    });

  });

});
