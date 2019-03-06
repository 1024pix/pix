const { sinon, expect, domainBuilder, hFake } = require('../../../test-helper');

const BookshelfUser = require('../../../../lib/infrastructure/data/user');
const User = require('../../../../lib/domain/models/User');
const SearchResultList = require('../../../../lib/domain/models/SearchResultList');

const userController = require('../../../../lib/application/users/user-controller');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');

const mailService = require('../../../../lib/domain/services/mail-service');
const userSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-serializer');
const membershipSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/membership-serializer');
const passwordResetService = require('../../../../lib/domain/services/reset-password-service');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const userService = require('../../../../lib/domain/services/user-service');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | user-controller', () => {

  describe('#save', () => {
    const email = 'to-be-free@ozone.airplane';
    const deserializedUser = new User({ password: 'password_1234' });
    const savedUser = new User({ email });

    beforeEach(() => {
      sinon.stub(userSerializer, 'deserialize').returns(deserializedUser);
      sinon.stub(userSerializer, 'serialize');
      sinon.stub(userRepository, 'create').resolves(savedUser);
      sinon.stub(validationErrorSerializer, 'serialize');
      sinon.stub(encryptionService, 'hashPassword');
      sinon.stub(mailService, 'sendAccountCreationEmail');
      sinon.stub(usecases, 'createUser');
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
  });

  describe('#getAuthenticatedUserProfile', () => {
    it('should be a function', () => {
      // then
      expect(userController.getAuthenticatedUserProfile).to.be.a('function');
    });
  });

  describe('#updateUser', () => {

    context('When payload is good (with a payload and a password attribute)', () => {
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
        sinon.stub(passwordResetService, 'hasUserAPasswordResetDemandInProgress');
        sinon.stub(passwordResetService, 'invalidOldResetPasswordDemand');
        sinon.stub(validationErrorSerializer, 'serialize');
        sinon.stub(userRepository, 'updatePassword');
        sinon.stub(userRepository, 'findUserById').resolves(user);
        sinon.stub(encryptionService, 'hashPassword');
      });

      it('should reply with no content', async () => {
        // given
        passwordResetService.hasUserAPasswordResetDemandInProgress.resolves();
        userRepository.updatePassword.resolves();
        passwordResetService.invalidOldResetPasswordDemand.resolves();

        // when
        const response = await userController.updateUser(request, hFake);

        // then
        expect(response).to.be.null;
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
        const usecaseUpdateUserPasswordStub = sinon.stub(usecases, 'updateUserPassword');

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
        const usecaseAcceptPixOrgaTermsOfServiceStub = sinon.stub(usecases, 'acceptPixOrgaTermsOfService');

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
        const usecaseAcceptPixCertifTermsOfServiceStub = sinon.stub(usecases, 'acceptPixCertifTermsOfService');

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

    const request = { params: { id: 1 } };

    beforeEach(() => {
      sinon.stub(userService, 'isUserExistingById').resolves(true);
      sinon.stub(userService, 'getProfileToCertify').resolves([]);
    });

    it('should be a function', () => {
      expect(userController).to.have.property('getProfileToCertify').and.to.be.a('function');
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

      sinon.stub(usecases, 'getUserWithMemberships').resolves();
      sinon.stub(userSerializer, 'serialize');
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
    const userId = '1';

    const request = {
      auth: {
        credentials: {
          userId: userId
        }
      },
      params: {
        id: userId
      }
    };

    beforeEach(() => {
      sinon.stub(membershipSerializer, 'serialize');
      sinon.stub(usecases, 'getUserWithMemberships');
    });

    it('should return serialized Organizations Accesses', async function() {
      // given
      usecases.getUserWithMemberships.withArgs({
        requestedUserId: userId,
        authenticatedUserId: userId,
      }).resolves({ memberships: [] });
      membershipSerializer.serialize.withArgs([]).returns({});

      // when
      const response = await userController.getMemberships(request, hFake);

      // then
      expect(response).to.deep.equal({});
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
