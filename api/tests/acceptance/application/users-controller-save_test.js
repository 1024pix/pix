const { expect, sinon } = require('../../test-helper');
const faker = require('faker');

const server = require('../../../server');
const User = require('../../../lib/infrastructure/data/user');

const mailService = require('../../../lib/domain/services/mail-service');
const userCreationValidator = require('../../../lib/domain/validators/user-creation-validator');
const { UserValidationErrors } = require('../../../lib/domain/errors');

const logger = require('../../../lib/infrastructure/logger');
const gRecaptcha = require('../../../lib/infrastructure/validators/grecaptcha-validator');


describe('Acceptance | Controller | users-controller-save', () => {

  let options;
  let attributes;
  let sendAccountCreationEmailStub;
  let loggerStub;
  let recaptchaVerifyStub;
  let userCreationValidatorStub;

  beforeEach(() => {
    sendAccountCreationEmailStub = sinon.stub(mailService, 'sendAccountCreationEmail');
    loggerStub = sinon.stub(logger, 'error').returns({});
    recaptchaVerifyStub = sinon.stub(gRecaptcha, 'verify').resolves();
    userCreationValidatorStub = sinon.stub(userCreationValidator, 'validate');

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

  afterEach(() => {
    sendAccountCreationEmailStub.restore();
    loggerStub.restore();
    recaptchaVerifyStub.restore();
    userCreationValidatorStub.restore();
  });

  it('should return 201 HTTP status code', () => {
    // given
    userCreationValidatorStub.resolves();

    // when
    const promise = server.inject(options);

    // then
    return promise.then((response) => {
      expect(response.statusCode).to.equal(201);
    });
  });

  it('should return 422 HTTP status code when there are user validation errors', function() {
    // Given
    const firstRegistration = server.inject(options);

    userCreationValidatorStub.rejects(new UserValidationErrors([]));

    // When
    const secondRegistration = firstRegistration.then(_ => {
      return server.inject(options);
    });

    // Then
    return secondRegistration.then((response) => {
      expect(response.statusCode).to.equal(422);
    });
  });

  it('should save the user in the database', () => {
    // when
    const promise = server.inject(options);
    userCreationValidatorStub.resolves();

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
    userCreationValidatorStub.resolves();

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

});
