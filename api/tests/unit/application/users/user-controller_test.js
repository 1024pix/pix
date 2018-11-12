const { sinon, expect, factory } = require('../../../test-helper');

const Boom = require('boom');

const BookshelfUser = require('../../../../lib/infrastructure/data/user');
const User = require('../../../../lib/domain/models/User');
const SearchResultList = require('../../../../lib/domain/models/SearchResultList');

const userController = require('../../../../lib/application/users/user-controller');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const logger = require('../../../../lib/infrastructure/logger');

const mailService = require('../../../../lib/domain/services/mail-service');
const userSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-serializer');
const membershipSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/membership-serializer');
const passwordResetService = require('../../../../lib/domain/services/reset-password-service');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const userService = require('../../../../lib/domain/services/user-service');
const usecases = require('../../../../lib/domain/usecases');

const {
  InternalError,
  EntityValidationError,
  UserNotAuthorizedToAccessEntity
} = require('../../../../lib/domain/errors');

describe('Unit | Controller | user-controller', () => {

  describe('#save', () => {

    let boomBadRequestMock;

    let replyStub;
    let codeStub;

    let sandbox;
    const email = 'to-be-free@ozone.airplane';
    const deserializedUser = new User({ password: 'password_1234' });
    const savedUser = new User({ email });

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      boomBadRequestMock = sinon.mock(Boom);

      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({
        code: codeStub,
      });

      sandbox.stub(logger, 'error').returns({});
      sandbox.stub(userSerializer, 'deserialize').returns(deserializedUser);
      sandbox.stub(userSerializer, 'serialize');
      sandbox.stub(userRepository, 'create').resolves(savedUser);
      sandbox.stub(validationErrorSerializer, 'serialize');
      sandbox.stub(encryptionService, 'hashPassword');
      sandbox.stub(mailService, 'sendAccountCreationEmail');
      sandbox.stub(usecases, 'createUser');
    });

    afterEach(() => {
      boomBadRequestMock.restore();
      sandbox.restore();
    });

    describe('when request is valid', () => {

      const request = {
        payload: {
          data: {
            attributes: {
              'first-name': 'John',
              'last-name': 'DoDoe',
              'email': 'john.dodoe@example.net',
              'password': 'A124B2C3#!',
              'cgu': true,
              'recaptcha-token': 'reCAPTCHAToken',
            },
          },
        },
      };

      beforeEach(() => {
        usecases.createUser.resolves(savedUser);
      });

      it('should return a serialized user and a 201 status code', () => {
        // given
        const expectedSerializedUser = { message: 'serialized user' };
        userSerializer.serialize.returns(expectedSerializedUser);

        // when
        const promise = userController.save(request, replyStub);

        // then
        return promise.then(() => {
          expect(userSerializer.serialize).to.have.been.calledWith(savedUser);
          expect(replyStub).to.have.been.calledWith(expectedSerializedUser);
          expect(codeStub).to.have.been.calledWith(201);
        });
      });

      it('should call the user creation usecase', () => {
        // given
        const reCaptchaToken = 'reCAPTCHAToken';
        const useCaseParameters = {
          user: deserializedUser,
          reCaptchaToken,
        };

        // when
        const promise = userController.save(request, replyStub);

        // then
        return promise.then(() => {
          expect(usecases.createUser).to.have.been.calledWith(useCaseParameters);
        });
      });
    });

    describe('when request is invalid', () => {

      const request = {
        payload: {
          data: {
            attributes: {
              firstName: '',
              lastName: '',
            },
          },
        },
      };

      it('should reply with code 422 when a validation error occurs', () => {
        // given
        const expectedValidationError = new EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'firstName',
              message: 'Votre prénom n’est pas renseigné.',
            },
            {
              attribute: 'password',
              message: 'Votre mot de passe n’est pas renseigné.',
            },
          ]
        });

        const jsonApiValidationErrors = {
          errors: [
            {
              status: '422',
              source: { 'pointer': '/data/attributes/first-name' },
              title: 'Invalid data attribute "firstName"',
              detail: 'Votre prénom n’est pas renseigné.'
            },
            {
              status: '422',
              source: { 'pointer': '/data/attributes/password' },
              title: 'Invalid data attribute "password"',
              detail: 'Votre mot de passe n’est pas renseigné.'
            }
          ]
        };
        usecases.createUser.rejects(expectedValidationError);

        // when
        const promise = userController.save(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(codeStub, 422);
          sinon.assert.calledWith(replyStub, jsonApiValidationErrors);
        });
      });
    });

    describe('when an internal error is raised', () => {

      let raisedError;
      const request = {
        payload: {
          data: {
            attributes: {},
          },
        },
      };

      beforeEach(() => {
        raisedError = new Error('Something wrong is going on in Gotham City');
        usecases.createUser.rejects(raisedError);
      });

      it('should reply with a badImplementation', () => {
        // given
        const expectedError = {
          errors: [
            {
              status: '500',
              title: 'Internal Server Error',
              detail: 'Une erreur est survenue lors de la création de l’utilisateur'
            }
          ]
        };

        // when
        const promise = userController.save(request, replyStub);

        // then
        return promise
          .then(() => {
            expect(replyStub).to.have.been.calledWith(expectedError);
          });
      });

      it('should log the error', () => {
        // given
        boomBadRequestMock.expects('badImplementation').returns({});

        // when
        const promise = userController.save(request, replyStub);

        // then
        return promise
          .then(() => {
            expect(logger.error).to.have.been.calledWith(raisedError);
          });
      });

    });

  });

  describe('#getAuthenticatedUserProfile', () => {
    it('should be a function', () => {
      // then
      expect(userController.getAuthenticatedUserProfile).to.be.a('function');
    });
  });

  describe('#updateUser', () => {

    context('When payload is good (with a payload and a password attribute)', () => {

      let sandbox;
      let reply;
      const request = {
        params: {
          id: 7,
        },
        payload: {
          data: {
            attributes: {
              password: 'Pix2017!',
            },
          },
        },
      };
      const user = new BookshelfUser({
        id: 7,
        email: 'maryz@acme.xh',
      });
      let codeStub;

      beforeEach(() => {
        sandbox = sinon.sandbox.create();
        sandbox.stub(passwordResetService, 'hasUserAPasswordResetDemandInProgress');
        sandbox.stub(passwordResetService, 'invalidOldResetPasswordDemand');
        sandbox.stub(validationErrorSerializer, 'serialize');
        sandbox.stub(userRepository, 'updatePassword');
        sandbox.stub(userRepository, 'findUserById').resolves(user);
        sandbox.stub(encryptionService, 'hashPassword');
        codeStub = sinon.stub();
        reply = sandbox.stub().returns({
          code: () => {
          },
        });
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should reply with no content', () => {
        // given
        passwordResetService.hasUserAPasswordResetDemandInProgress.resolves();
        userRepository.updatePassword.resolves();
        passwordResetService.invalidOldResetPasswordDemand.resolves();

        // when
        const promise = userController.updateUser(request, reply);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(reply);
        });
      });

      describe('When unknown error is handle', () => {
        it('should reply with a serialized  error', () => {
          // given
          const error = new InternalError();
          reply.returns({
            code: codeStub,
          });
          const serializedError = {
            errors: [{
              detail: 'Une erreur interne est survenue.',
              status: '500',
              title: 'Internal Server Error'
            }]
          };
          validationErrorSerializer.serialize.returns(serializedError);
          passwordResetService.hasUserAPasswordResetDemandInProgress.rejects(error);

          // when
          const promise = userController.updateUser(request, reply);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(reply);
            sinon.assert.calledWith(reply, serializedError);
            sinon.assert.calledWith(codeStub, 500);
          });
        });
      });

    });

    context('When payload contains no password field nor pix-orga-terms-of-service-accepted field', () => {

      it('should returns 400 status code', () => {
        // given
        const request = {
          params: {
            id: 7,
          },
          payload: {
            data: {
              attributes: {
                'unknown-attribute': true,
              },
            },
          },
        };
        const sandbox = sinon.sandbox.create();
        const codeStub = sandbox.stub();
        const reply = sandbox.stub().returns({
          code: codeStub,
        });

        // when
        const promise = userController.updateUser(request, reply);

        // then
        return promise.then(() => {
          expect(codeStub).to.have.been.calledWith(400);
        });

      });
    });

    context('When payload has a password field', () => {
      it('should update password', () => {
        // given
        const userId = 7;
        const password = 'PIX123$';
        const request = {
          params: {
            id: userId,
          },
          payload: {
            data: {
              attributes: {
                password,
              },
            },
          },
        };
        const sandbox = sinon.sandbox.create();
        const codeStub = sandbox.stub();
        const reply = sandbox.stub().returns({
          code: codeStub,
        });
        const usecaseUpdateUserPasswordStub = sandbox.stub(usecases, 'updateUserPassword');

        // when
        const promise = userController.updateUser(request, reply);

        // then
        return promise.then(() => {
          expect(usecaseUpdateUserPasswordStub).to.have.been.calledWith({ userId, password });
        });
      });

    });

    context('When payload has a pix-orga-terms-of-service-accepted field', () => {

      it('should accept pix orga terms of service', () => {
        // given
        const userId = 7;
        const request = {
          params: {
            id: userId,
          },
          payload: {
            data: {
              attributes: {
                'pix-orga-terms-of-service-accepted': true,
              },
            },
          },
        };
        const sandbox = sinon.sandbox.create();
        const codeStub = sandbox.stub();
        const reply = sandbox.stub().returns({
          code: codeStub,
        });
        const usecaseAcceptPixOrgaTermsOfServiceStub = sandbox.stub(usecases, 'acceptPixOrgaTermsOfService');

        // when
        const promise = userController.updateUser(request, reply);

        // then
        return promise.then(() => {
          expect(usecaseAcceptPixOrgaTermsOfServiceStub).to.have.been.calledWith({ userId });
        });
      });
    });
  });

  describe('#getProfileToCertify', () => {

    let sandbox;
    let replyStub;

    const request = { params: { id: 1 } };
    const jsonAPI404error = { message: 'Error' };
    const jsonAPI500error = { message: 'Internal Error' };

    beforeEach(() => {
      replyStub = sinon.stub();
      sandbox = sinon.sandbox.create();

      sandbox.stub(userService, 'isUserExistingById').resolves(true);
      sandbox.stub(userService, 'getProfileToCertify').resolves([]);
      sandbox.stub(Boom, 'badRequest').returns(jsonAPI404error);
      sandbox.stub(Boom, 'badImplementation').returns(jsonAPI500error);
      sandbox.stub(logger, 'error').returns({});
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should be a function', () => {
      expect(userController).to.have.property('getProfileToCertify').and.to.be.a('function');
    });

    context('when loading user competences fails', () => {
      it('should reply with an INTERNAL error', () => {
        // given
        const anyErrorFromProfileBuilding = new Error();
        userService.getProfileToCertify.rejects(anyErrorFromProfileBuilding);

        // when
        const promise = userController.getProfileToCertify(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(replyStub);

          sinon.assert.notCalled(Boom.badRequest);
          sinon.assert.calledOnce(Boom.badImplementation);
          sinon.assert.calledWith(Boom.badImplementation, anyErrorFromProfileBuilding);
        });
      });

      it('should log the error', () => {
        // given
        const anyErrorFromProfileBuilding = new Error();
        userService.getProfileToCertify.rejects(anyErrorFromProfileBuilding);

        // when
        const promise = userController.getProfileToCertify(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(logger.error);
          sinon.assert.calledWith(logger.error, anyErrorFromProfileBuilding);
        });
      });
    });

    context('when the user exists', () => {

      let clock;

      beforeEach(() => {
        clock = sinon.useFakeTimers();
      });

      afterEach(() => {
        clock.restore();
      });

      it('should load his current achieved assessments', () => {
        // when
        const promise = userController.getProfileToCertify(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(userService.getProfileToCertify);
          sinon.assert.calledWith(userService.getProfileToCertify, 1, '1970-01-01T00:00:00.000Z');
        });
      });

      it('should reply the skillProfile', () => {
        // when
        const promise = userController.getProfileToCertify(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(replyStub, []);
        });
      });
    });
  });

  describe('#getUser', () => {

    let sandbox;
    let requestedUserId;
    let authenticatedUserId;
    let codeStub;
    let replyStub;
    let request;

    beforeEach(() => {
      authenticatedUserId = requestedUserId = 72;
      request = {
        auth: {
          credentials: {
            userId: authenticatedUserId
          }
        },
        params: {
          id: requestedUserId
        }
      };

      sandbox = sinon.sandbox.create();
      codeStub = sandbox.stub();
      replyStub = sandbox.stub().returns({ code: codeStub });
      sandbox.stub(usecases, 'getUserWithMemberships').resolves();
      sandbox.stub(userSerializer, 'serialize');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should retrieve user informations from user Id', () => {
      // when
      const promise = userController.getUser(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.getUserWithMemberships).to.have.been.calledWith({
          authenticatedUserId,
          requestedUserId,
        });
      });
    });

    it('should serialize the authenticated user', () => {
      // given
      const foundUser = factory.buildUser();
      usecases.getUserWithMemberships.resolves(foundUser);

      // when
      const promise = userController.getUser(request, replyStub);

      // then
      return promise.then(() => {
        expect(userSerializer.serialize).to.have.been.calledWith(foundUser);
      });
    });

    it('should return 403 if authenticated user is not authorized to access requested user id', () => {
      // given
      const expectedError = {
        errors: [{
          code: '403',
          detail: 'Vous n’avez pas accès à cet utilisateur',
          title: 'Forbidden Access'
        }]
      };
      usecases.getUserWithMemberships.rejects(new UserNotAuthorizedToAccessEntity());

      // when
      const promise = userController.getUser(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(codeStub, 403);
        sinon.assert.calledWith(replyStub, expectedError);
      });
    });

    it('should return the user found based on the given userId', () => {
      // given
      const foundUser = factory.buildUser();
      const serializedUser = {
        data: {
          type: 'users',
          id: foundUser.id,
          attributes: {
            'first-name': foundUser.firstName,
            'last-name': foundUser.lastName,
            'email': foundUser.email,
            'cgu': foundUser.cgu
          }
        }
      };
      usecases.getUserWithMemberships.resolves(foundUser);
      userSerializer.serialize.returns(serializedUser);

      // when
      const promise = userController.getUser(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.calledWith(serializedUser);
      });
    });

  });

  describe('#getMemberships', () => {

    let sandbox;
    const authenticatedUserId = 1;
    const requestedUserId = '1';
    const request = {
      auth: {
        credentials: {
          userId: authenticatedUserId
        }
      },
      params: {
        id: requestedUserId
      }
    };
    let codeStub;
    let replyStub;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(membershipSerializer, 'serialize');
      codeStub = sandbox.stub();
      replyStub = sandbox.stub().returns({ code: codeStub });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should get accesses of the user passed on params', () => {
      // given
      const stringifiedAuthenticatedUserId = authenticatedUserId.toString();
      sandbox.stub(usecases, 'getUserWithMemberships').resolves();

      // when
      const promise = userController.getMemberships(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.getUserWithMemberships).to.have.been.calledWith({
          requestedUserId,
          authenticatedUserId: stringifiedAuthenticatedUserId,
        });
      });
    });

    context('When accesses are found', () => {

      beforeEach(() => {
        sandbox.stub(usecases, 'getUserWithMemberships');
      });

      it('should serialize found memberships', () => {
        // given
        const foundAccesses = [];
        const foundUser = new User({ memberships: foundAccesses });
        usecases.getUserWithMemberships.resolves(foundUser);

        // when
        const promise = userController.getMemberships(request, replyStub);

        // then
        return promise.then(() => {
          expect(membershipSerializer.serialize).to.have.been.calledWith(foundAccesses);
        });
      });

      it('should return serialized Organizations Accesses, a 200 code response', function() {
        // given
        const serializedMemberships = {};
        membershipSerializer.serialize.returns(serializedMemberships);
        usecases.getUserWithMemberships.resolves({});

        // when
        const promise = userController.getMemberships(request, replyStub);

        // then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledWith(serializedMemberships);
          expect(codeStub).to.have.been.calledWith(200);
        });
      });

    });

    context('When authenticated user want to retrieve access of another user', () => {
      it('should return a 403 Forbidden access error ', () => {
        // given
        sandbox.stub(usecases, 'getUserWithMemberships').rejects(new UserNotAuthorizedToAccessEntity());

        // when
        const promise = userController.getMemberships(request, replyStub);

        // then
        return promise.then(() => {
          expect(codeStub).to.have.been.calledWith(403);
        });
      });

    });

    context('When an unexpected error occurs', () => {
      it('should return a 500 internal error ', () => {
        // given
        sandbox.stub(usecases, 'getUserWithMemberships').rejects(new Error());

        // when
        const promise = userController.getMemberships(request, replyStub);

        // then
        return promise.then(() => {
          expect(codeStub).to.have.been.calledWith(500);
        });
      });

    });

  });

  describe('#find', () => {

    beforeEach(() => {
      sinon.stub(usecases, 'findUsers');
      sinon.stub(userSerializer, 'serialize');
    });

    afterEach(() => {
      usecases.findUsers.restore();
      userSerializer.serialize.restore();
    });

    it('should return a list of JSON API users fetched from the data repository', () => {
      // given
      const request = { query: {} };
      const replyStub = sinon.stub();
      usecases.findUsers.resolves(new SearchResultList());
      userSerializer.serialize.returns({ data: {}, meta: {} });

      // when
      const promise = userController.find(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.findUsers).to.have.been.calledOnce;
        expect(userSerializer.serialize).to.have.been.calledOnce;
        expect(replyStub).to.have.been.calledOnce;
      });
    });

    it('should return a JSON API response with pagination information in the data field "meta"', () => {
      // given
      const request = { query: {} };
      const replyStub = sinon.stub();
      const searchResultList = new SearchResultList({
        page: 2,
        pageSize: 25,
        totalResults: 100,
        paginatedResults: [new User({ id: 1 }), new User({ id: 2 }), new User({ id: 3 })],
      });
      usecases.findUsers.resolves(searchResultList);

      // when
      const promise = userController.find(request, replyStub);

      // then
      return promise.then(() => {
        const expectedResults = searchResultList.paginatedResults;
        const expectedMeta = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4, };
        expect(userSerializer.serialize).to.have.been.calledWithExactly(expectedResults, expectedMeta);
      });
    });

    it('should allow to filter users by first name', () => {
      // given
      const request = { query: { firstName: 'first_name' } };
      const replyStub = sinon.stub();
      usecases.findUsers.resolves(new SearchResultList());

      // when
      const promise = userController.find(request, replyStub);

      // then
      return promise.then(() => {
        const expectedFilters = { firstName: 'first_name' };
        expect(usecases.findUsers).to.have.been.calledWithMatch({ filters: expectedFilters });
      });
    });

    it('should allow to filter users by last name', () => {
      // given
      const request = { query: { lastName: 'last_name' } };
      const replyStub = sinon.stub();
      usecases.findUsers.resolves(new SearchResultList());

      // when
      const promise = userController.find(request, replyStub);

      // then
      return promise.then(() => {
        const expectedFilters = { lastName: 'last_name' };
        expect(usecases.findUsers).to.have.been.calledWithMatch({ filters: expectedFilters });
      });
    });

    it('should allow to filter users by email', () => {
      // given
      const request = { query: { email: 'email' } };
      const replyStub = sinon.stub();
      usecases.findUsers.resolves(new SearchResultList());

      // when
      const promise = userController.find(request, replyStub);

      // then
      return promise.then(() => {
        const expectedFilters = { email: 'email' };
        expect(usecases.findUsers).to.have.been.calledWithMatch({ filters: expectedFilters });
      });
    });

    it('should allow to paginate on a given page and page size', () => {
      // given
      const request = { query: { page: 2, pageSize: 25 } };
      const replyStub = sinon.stub();
      usecases.findUsers.resolves(new SearchResultList());

      // when
      const promise = userController.find(request, replyStub);

      // then
      return promise.then(() => {
        const expectedPagination = { page: 2, pageSize: 25 };
        expect(usecases.findUsers).to.have.been.calledWithMatch({ pagination: expectedPagination });
      });
    });

    it('should paginate on page 1 for a page size of 10 elements by default', () => {
      // given
      const request = { query: {} };
      const replyStub = sinon.stub();
      usecases.findUsers.resolves(new SearchResultList());

      // when
      const promise = userController.find(request, replyStub);

      // then
      return promise.then(() => {
        const expectedPagination = { page: 1, pageSize: 10 };
        expect(usecases.findUsers).to.have.been.calledWithMatch({ pagination: expectedPagination });
      });
    });
  });
});
