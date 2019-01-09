const { sinon, expect, domainBuilder, hFake } = require('../../../test-helper');

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
    let sandbox;
    const email = 'to-be-free@ozone.airplane';
    const deserializedUser = new User({ password: 'password_1234' });
    const savedUser = new User({ email });

    beforeEach(() => {
      sandbox = sinon.createSandbox();

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

      it('should return a serialized user and a 201 status code', async () => {
        // given
        const expectedSerializedUser = { message: 'serialized user' };
        userSerializer.serialize.returns(expectedSerializedUser);

        // when
        const response = await userController.save(request, hFake);

        // then
        expect(userSerializer.serialize).to.have.been.calledWith(savedUser);
        expect(response.source).to.deep.equal(expectedSerializedUser);
        expect(response.statusCode).to.equal(201);
      });

      it('should call the user creation usecase', async () => {
        // given
        const reCaptchaToken = 'reCAPTCHAToken';
        const useCaseParameters = {
          user: deserializedUser,
          reCaptchaToken,
        };

        // when
        await userController.save(request, hFake);

        // then
        expect(usecases.createUser).to.have.been.calledWith(useCaseParameters);
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

      it('should reply with code 422 when a validation error occurs', async () => {
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
        const response = await userController.save(request, hFake);

        // then
        expect(response.statusCode).to.equal(422);
        expect(response.source).to.deep.equal(jsonApiValidationErrors);
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

      it('should reply with a badImplementation', async () => {
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
        const response = await userController.save(request, hFake);

        // then
        expect(response.source).to.deep.equal(expectedError);
      });

      it('should log the error', async () => {
        // when
        await userController.save(request, hFake);

        // then
        expect(logger.error).to.have.been.calledWith(raisedError);
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

      beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(passwordResetService, 'hasUserAPasswordResetDemandInProgress');
        sandbox.stub(passwordResetService, 'invalidOldResetPasswordDemand');
        sandbox.stub(validationErrorSerializer, 'serialize');
        sandbox.stub(userRepository, 'updatePassword');
        sandbox.stub(userRepository, 'findUserById').resolves(user);
        sandbox.stub(encryptionService, 'hashPassword');
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should reply with no content', async () => {
        // given
        passwordResetService.hasUserAPasswordResetDemandInProgress.resolves();
        userRepository.updatePassword.resolves();
        passwordResetService.invalidOldResetPasswordDemand.resolves();

        // when
        const response = await userController.updateUser(request, hFake);

        // then
        expect(response.source).to.be.undefined;
      });

      describe('When unknown error is handle', () => {
        it('should reply with a serialized  error', async () => {
          // given
          const error = new InternalError();
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
          const response = await userController.updateUser(request, hFake);

          // then
          expect(response.source).to.deep.equal(serializedError);
          expect(response.statusCode).to.equal(500);
        });
      });
    });

    context('When payload does not contain any field', () => {

      it('should returns 400 status code', async () => {
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

        // when
        const response = await userController.updateUser(request, hFake);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('When payload has a password field', () => {
      it('should update password', async () => {
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
        const sandbox = sinon.createSandbox();
        const usecaseUpdateUserPasswordStub = sandbox.stub(usecases, 'updateUserPassword');

        // when
        await userController.updateUser(request, hFake);

        // then
        expect(usecaseUpdateUserPasswordStub).to.have.been.calledWith({ userId, password });
      });

    });

    context('When payload has a pix-orga-terms-of-service-accepted field', () => {

      it('should accept pix orga terms of service', async () => {
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
        const sandbox = sinon.createSandbox();
        const usecaseAcceptPixOrgaTermsOfServiceStub = sandbox.stub(usecases, 'acceptPixOrgaTermsOfService');

        // when
        await userController.updateUser(request, hFake);

        // then
        expect(usecaseAcceptPixOrgaTermsOfServiceStub).to.have.been.calledWith({ userId });
      });
    });

    context('When payload has a pix-certif-terms-of-service-accepted field', () => {

      it('should accept pix certif terms of service', () => {
        // given
        const userId = 7;
        const request = {
          params: {
            id: userId,
          },
          payload: {
            data: {
              attributes: {
                'pix-certif-terms-of-service-accepted': true,
              },
            },
          },
        };
        const sandbox = sinon.createSandbox();
        const usecaseAcceptPixCertifTermsOfServiceStub = sandbox.stub(usecases, 'acceptPixCertifTermsOfService');

        // when
        const promise = userController.updateUser(request, hFake);

        // then
        return promise.then(() => {
          expect(usecaseAcceptPixCertifTermsOfServiceStub).to.have.been.calledWith({ userId });
        });
      });
    });
  });

  describe('#getProfileToCertify', () => {
    let sandbox;

    const request = { params: { id: 1 } };

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      sandbox.stub(userService, 'isUserExistingById').resolves(true);
      sandbox.stub(userService, 'getProfileToCertify').resolves([]);
      sandbox.stub(logger, 'error').returns({});
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should be a function', () => {
      expect(userController).to.have.property('getProfileToCertify').and.to.be.a('function');
    });

    context('when loading user competences fails', () => {
      it('should reply with an INTERNAL error and log the error', async () => {
        // given
        const anyErrorFromProfileBuilding = new Error('Error building profile');
        userService.getProfileToCertify.rejects(anyErrorFromProfileBuilding);

        // when
        const promise = userController.getProfileToCertify(request, hFake);

        // then
        await expect(promise).to.be.rejected
          .and.eventually.to.include.nested({
            message: 'Error building profile',
            'output.statusCode': 500,
          });
        expect(logger.error).to.have.been.calledWith(anyErrorFromProfileBuilding);
      });
    });

    context('when the user exists', () => {

      beforeEach(() => {
        sinon.useFakeTimers();
      });

      it('should load his current achieved assessments', async () => {
        // when
        await userController.getProfileToCertify(request, hFake);

        // then
        sinon.assert.calledOnce(userService.getProfileToCertify);
        sinon.assert.calledWith(userService.getProfileToCertify, 1, '1970-01-01T00:00:00.000Z');
      });

      it('should reply the skillProfile', async () => {
        // when
        const response = await userController.getProfileToCertify(request, hFake);

        // then
        expect(response).to.deep.equal([]);
      });
    });
  });

  describe('#getUser', () => {
    let sandbox;
    let requestedUserId;
    let authenticatedUserId;
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

      sandbox = sinon.createSandbox();
      sandbox.stub(usecases, 'getUserWithMemberships').resolves();
      sandbox.stub(userSerializer, 'serialize');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should retrieve user informations from user Id', async () => {
      // when
      await userController.getUser(request, hFake);

      // then
      expect(usecases.getUserWithMemberships).to.have.been.calledWith({
        authenticatedUserId,
        requestedUserId,
      });
    });

    it('should serialize the authenticated user', async () => {
      // given
      const foundUser = domainBuilder.buildUser();
      usecases.getUserWithMemberships.resolves(foundUser);

      // when
      await userController.getUser(request, hFake);

      // then
      expect(userSerializer.serialize).to.have.been.calledWith(foundUser);
    });

    it('should return 403 if authenticated user is not authorized to access requested user id', async () => {
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
      const response = await userController.getUser(request, hFake);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.source).to.deep.equal(expectedError);
    });

    it('should return the user found based on the given userId', async () => {
      // given
      const foundUser = domainBuilder.buildUser();
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
      const response = await userController.getUser(request, hFake);

      // then
      expect(response).to.deep.equal(serializedUser);
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

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(membershipSerializer, 'serialize');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should get accesses of the user passed on params', async () => {
      // given
      const stringifiedAuthenticatedUserId = authenticatedUserId.toString();
      sandbox.stub(usecases, 'getUserWithMemberships').resolves();

      // when
      await userController.getMemberships(request, hFake);

      // then
      expect(usecases.getUserWithMemberships).to.have.been.calledWith({
        requestedUserId,
        authenticatedUserId: stringifiedAuthenticatedUserId,
      });
    });

    context('When accesses are found', () => {

      beforeEach(() => {
        sandbox.stub(usecases, 'getUserWithMemberships');
      });

      it('should serialize found memberships', async () => {
        // given
        const foundAccesses = [];
        const foundUser = new User({ memberships: foundAccesses });
        usecases.getUserWithMemberships.resolves(foundUser);

        // when
        await userController.getMemberships(request, hFake);

        // then
        expect(membershipSerializer.serialize).to.have.been.calledWith(foundAccesses);
      });

      it('should return serialized Organizations Accesses, a 200 code response', async function() {
        // given
        const serializedMemberships = {};
        membershipSerializer.serialize.returns(serializedMemberships);
        usecases.getUserWithMemberships.resolves({});

        // when
        const response = await userController.getMemberships(request, hFake);

        // then
        expect(response).to.deep.equal(serializedMemberships);
      });

    });

    context('When authenticated user want to retrieve access of another user', () => {
      it('should return a 403 Forbidden access error ', async () => {
        // given
        sandbox.stub(usecases, 'getUserWithMemberships').rejects(new UserNotAuthorizedToAccessEntity());

        // when
        const response = await userController.getMemberships(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
      });

    });

    context('When an unexpected error occurs', () => {
      it('should return a 500 internal error ', async () => {
        // given
        sandbox.stub(usecases, 'getUserWithMemberships').rejects(new Error());

        // when
        const response = await userController.getMemberships(request, hFake);

        // then
        expect(response.statusCode).to.equal(500);
      });

    });
  });

  describe('#find', () => {

    beforeEach(() => {
      sinon.stub(usecases, 'findUsers');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should return a list of JSON API users fetched from the data repository', async () => {
      // given
      const request = { query: {} };
      usecases.findUsers.resolves(new SearchResultList());
      userSerializer.serialize.returns({ data: {}, meta: {} });

      // when
      await userController.find(request, hFake);

      // then
      expect(usecases.findUsers).to.have.been.calledOnce;
      expect(userSerializer.serialize).to.have.been.calledOnce;
    });

    it('should return a JSON API response with pagination information in the data field "meta"', async () => {
      // given
      const request = { query: {} };
      const searchResultList = new SearchResultList({
        page: 2,
        pageSize: 25,
        totalResults: 100,
        paginatedResults: [new User({ id: 1 }), new User({ id: 2 }), new User({ id: 3 })],
      });
      usecases.findUsers.resolves(searchResultList);

      // when
      await userController.find(request, hFake);

      // then
      const expectedResults = searchResultList.paginatedResults;
      const expectedMeta = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4, };
      expect(userSerializer.serialize).to.have.been.calledWithExactly(expectedResults, expectedMeta);
    });

    it('should allow to filter users by first name', async () => {
      // given
      const request = { query: { firstName: 'first_name' } };
      usecases.findUsers.resolves(new SearchResultList());

      // when
      await userController.find(request, hFake);

      // then
      const expectedFilters = { firstName: 'first_name' };
      expect(usecases.findUsers).to.have.been.calledWithMatch({ filters: expectedFilters });
    });

    it('should allow to filter users by last name', async () => {
      // given
      const request = { query: { lastName: 'last_name' } };
      usecases.findUsers.resolves(new SearchResultList());

      // when
      await userController.find(request, hFake);

      // then
      const expectedFilters = { lastName: 'last_name' };
      expect(usecases.findUsers).to.have.been.calledWithMatch({ filters: expectedFilters });
    });

    it('should allow to filter users by email', async () => {
      // given
      const request = { query: { email: 'email' } };
      usecases.findUsers.resolves(new SearchResultList());

      // when
      await userController.find(request, hFake);

      // then
      const expectedFilters = { email: 'email' };
      expect(usecases.findUsers).to.have.been.calledWithMatch({ filters: expectedFilters });
    });

    it('should allow to paginate on a given page and page size', async () => {
      // given
      const request = { query: { page: 2, pageSize: 25 } };
      usecases.findUsers.resolves(new SearchResultList());

      // when
      await userController.find(request, hFake);

      // then
      const expectedPagination = { page: 2, pageSize: 25 };
      expect(usecases.findUsers).to.have.been.calledWithMatch({ pagination: expectedPagination });
    });

    it('should paginate on page 1 for a page size of 10 elements by default', async () => {
      // given
      const request = { query: {} };
      usecases.findUsers.resolves(new SearchResultList());

      // when
      await userController.find(request, hFake);

      // then
      const expectedPagination = { page: 1, pageSize: 10 };
      expect(usecases.findUsers).to.have.been.calledWithMatch({ pagination: expectedPagination });
    });
  });
});
