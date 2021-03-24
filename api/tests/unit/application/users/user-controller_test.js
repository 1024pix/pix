const { sinon, expect, hFake } = require('../../../test-helper');

const PlacementProfile = require('../../../../lib/domain/models/PlacementProfile');
const User = require('../../../../lib/domain/models/User');

const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');

const encryptionService = require('../../../../lib/domain/services/encryption-service');
const mailService = require('../../../../lib/domain/services/mail-service');

const usecases = require('../../../../lib/domain/usecases');

const campaignParticipationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-serializer');
const campaignParticipationOverviewSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-overview-serializer');
const membershipSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/membership-serializer');
const scorecardSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/scorecard-serializer');
const profileSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/profile-serializer');
const userSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-serializer');
const userDetailsForAdminSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-details-for-admin-serializer');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');

const userController = require('../../../../lib/application/users/user-controller');

describe('Unit | Controller | user-controller', function() {

  describe('#save', function() {
    const email = 'to-be-free@ozone.airplane';
    const password = 'Password123';

    const deserializedUser = new User();
    const savedUser = new User({ email });
    const locale = 'fr-fr';

    beforeEach(function() {
      sinon.stub(userSerializer, 'deserialize').returns(deserializedUser);
      sinon.stub(userSerializer, 'serialize');
      sinon.stub(userRepository, 'create').resolves(savedUser);
      sinon.stub(validationErrorSerializer, 'serialize');
      sinon.stub(encryptionService, 'hashPassword');
      sinon.stub(mailService, 'sendAccountCreationEmail');
      sinon.stub(usecases, 'createUser').resolves(savedUser);
    });

    describe('when request is valid', function() {

      const request = {
        payload: {
          data: {
            attributes: {
              'first-name': 'John',
              'last-name': 'DoDoe',
              'email': 'john.dodoe@example.net',
              'cgu': true,
              password,
            },
          },
        },
      };

      it('should return a serialized user and a 201 status code', async function() {
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

      it('should call the user creation usecase', async function() {
        // given
        const useCaseParameters = {
          user: deserializedUser,
          password,
          locale,
          campaignCode: null,
        };

        // when
        await userController.save(request, hFake);

        // then
        expect(usecases.createUser).to.have.been.calledWith(useCaseParameters);
      });
    });
  });

  describe('#updatePassword', function() {

    const userId = 7;
    const userPassword = 'Pix2017!';
    const userTemporaryKey = 'good-temporary-key';
    const payload = {
      data: {
        attributes: {
          password: userPassword,
        },
      },
    };
    const request = {
      params: {
        id: userId,
      },
      query: {
        'temporary-key': userTemporaryKey,
      },
      payload,
    };

    beforeEach(function() {
      sinon.stub(usecases, 'updateUserPassword');
      sinon.stub(userSerializer, 'serialize');
      sinon.stub(userSerializer, 'deserialize');
    });

    it('should update password', async function() {
      // given
      userSerializer.deserialize.withArgs(payload).returns({ password: userPassword, temporaryKey: userTemporaryKey });
      usecases.updateUserPassword.withArgs({
        userId,
        password: userPassword,
        temporaryKey: userTemporaryKey,
      }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.updatePassword(request);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#updateUserDetailsForAdministration', function() {

    const userId = 1132;
    const newEmail = 'partiel@update.com';

    beforeEach(function() {
      sinon.stub(usecases, 'updateUserDetailsForAdministration');
      sinon.stub(userDetailsForAdminSerializer, 'serialize');
      sinon.stub(userDetailsForAdminSerializer, 'deserialize');
    });

    it('should update email,firstName,lastName', async function() {

      const lastName = 'newLastName';
      const firstName = 'newFirstName';
      const payload = {
        data: {
          attributes: {
            email: newEmail,
            lastName: 'newLastName',
            firstName: 'newFirstName',
          },
        },
      };
      const request = {
        params: {
          id: userId,
        },
        payload,
      };

      // given
      userDetailsForAdminSerializer.deserialize.withArgs(payload).returns({ email: newEmail, lastName, firstName });
      usecases.updateUserDetailsForAdministration.resolves({ email: newEmail, lastName, firstName });
      userDetailsForAdminSerializer.serialize.returns('updated');

      // when
      const response = await userController.updateUserDetailsForAdministration(request);

      // then
      expect(response).to.be.equal('updated');
    });

    it('should update email only', async function() {
      // given
      const payload = {
        data: {
          attributes: {
            email: newEmail,
          },
        },
      };
      const request = {
        params: {
          id: userId,
        },
        payload,
      };

      userDetailsForAdminSerializer.deserialize.withArgs(payload).returns({ email: newEmail });
      usecases.updateUserDetailsForAdministration.resolves({ email: newEmail });
      userDetailsForAdminSerializer.serialize.returns(newEmail);

      // when
      const response = await userController.updateUserDetailsForAdministration(request);

      // then
      expect(response).to.be.equal(newEmail);
    });
  });

  describe('#acceptPixLastTermsOfService', function() {
    let request;
    const userId = 1;

    beforeEach(function() {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId },
      };

      sinon.stub(usecases, 'acceptPixLastTermsOfService');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should accept pix terms of service', async function() {
      // given
      usecases.acceptPixLastTermsOfService.withArgs({ userId }).resolves({});
      const stubSerializedObject = 'ok';
      userSerializer.serialize.withArgs({}).returns(stubSerializedObject);

      // when
      const response = await userController.acceptPixLastTermsOfService(request);

      // then
      expect(response).to.be.equal(stubSerializedObject);
    });
  });

  describe('#acceptPixOrgaTermsOfService', function() {
    let request;
    const userId = 1;

    beforeEach(function() {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId },
      };

      sinon.stub(usecases, 'acceptPixOrgaTermsOfService');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should accept pix orga terms of service', async function() {
      // given
      usecases.acceptPixOrgaTermsOfService.withArgs({ userId }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.acceptPixOrgaTermsOfService(request);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#acceptPixCertifTermsOfService', function() {
    let request;
    const userId = 1;

    beforeEach(function() {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId },
      };

      sinon.stub(usecases, 'acceptPixCertifTermsOfService');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should accept pix certif terms of service', async function() {
      // given
      usecases.acceptPixCertifTermsOfService.withArgs({ userId }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.acceptPixCertifTermsOfService(request);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#changeLang', function() {
    let request;
    const userId = 1;
    const lang = 'en';

    beforeEach(function() {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId, lang },
      };

      sinon.stub(usecases, 'changeUserLang');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should modify lang of user', async function() {
      // given
      usecases.changeUserLang.withArgs({ userId, lang }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.changeLang(request);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#rememberUserHasSeenAssessmentInstructions', function() {
    let request;
    const userId = 1;

    beforeEach(function() {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId },
      };

      sinon.stub(usecases, 'rememberUserHasSeenAssessmentInstructions');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should remember user has seen assessment instructions', async function() {
      // given
      usecases.rememberUserHasSeenAssessmentInstructions.withArgs({ userId }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.rememberUserHasSeenAssessmentInstructions(request);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#rememberUserHasSeenNewDashboardInfo', function() {
    let request;
    const userId = 1;

    beforeEach(function() {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId },
      };

      sinon.stub(usecases, 'rememberUserHasSeenNewDashboardInfo');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should remember user has seen new dashboard info', async function() {
      // given
      usecases.rememberUserHasSeenNewDashboardInfo.withArgs({ userId }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.rememberUserHasSeenNewDashboardInfo(request);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#getCurrentUser', function() {
    let request;

    beforeEach(function() {
      request = { auth: { credentials: { userId: 1 } } };

      sinon.stub(usecases, 'getCurrentUser');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should get the current user', async function() {
      // given
      usecases.getCurrentUser.withArgs({ authenticatedUserId: 1 }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.getCurrentUser(request);

      // then
      expect(response).to.be.equal('ok');
    });

  });

  describe('#getUserDetailsForAdmin', function() {
    let request;

    beforeEach(function() {
      request = { params: { id: '123' } };

      sinon.stub(usecases, 'getUserDetailsForAdmin');
      sinon.stub(userDetailsForAdminSerializer, 'serialize');
    });

    it('should get the specified user for admin context', async function() {
      // given
      usecases.getUserDetailsForAdmin.withArgs({ userId: 123 }).resolves('userDetail');
      userDetailsForAdminSerializer.serialize.withArgs('userDetail').returns('ok');

      // when
      const response = await userController.getUserDetailsForAdmin(request);

      // then
      expect(response).to.be.equal('ok');
    });

  });

  describe('#getMemberships', function() {
    const userId = '1';

    const request = {
      auth: {
        credentials: {
          userId: userId,
        },
      },
      params: {
        id: userId,
      },
    };

    beforeEach(function() {
      sinon.stub(membershipSerializer, 'serialize');
      sinon.stub(usecases, 'getUserWithMemberships');
    });

    it('should return serialized Memberships', async function() {
      // given
      usecases.getUserWithMemberships.withArgs({ userId }).resolves({ memberships: [] });
      membershipSerializer.serialize.withArgs([]).returns({});

      // when
      const response = await userController.getMemberships(request, hFake);

      // then
      expect(response).to.deep.equal({});
    });
  });

  describe('#findPaginatedFilteredUsers', function() {

    beforeEach(function() {
      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(usecases, 'findPaginatedFilteredUsers');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should return a list of JSON API users fetched from the data repository', async function() {
      // given
      const request = { query: {} };
      queryParamsUtils.extractParameters.withArgs({}).returns({});
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });
      userSerializer.serialize.returns({ data: {}, meta: {} });

      // when
      await userController.findPaginatedFilteredUsers(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledOnce;
      expect(userSerializer.serialize).to.have.been.calledOnce;
    });

    it('should return a JSON API response with pagination information', async function() {
      // given
      const request = { query: {} };
      const expectedResults = [new User({ id: 1 }), new User({ id: 2 }), new User({ id: 3 })];
      const expectedPagination = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4 };
      queryParamsUtils.extractParameters.withArgs({}).returns({});
      usecases.findPaginatedFilteredUsers.resolves({ models: expectedResults, pagination: expectedPagination });

      // when
      await userController.findPaginatedFilteredUsers(request, hFake);

      // then
      expect(userSerializer.serialize).to.have.been.calledWithExactly(expectedResults, expectedPagination);
    });

    it('should allow to filter users by first name', async function() {
      // given
      const query = { filter: { firstName: 'Alexia' }, page: {} };
      const request = { query };
      queryParamsUtils.extractParameters.withArgs(query).returns(query);
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });

      // when
      await userController.findPaginatedFilteredUsers(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledWithMatch(query);
    });

    it('should allow to filter users by last name', async function() {
      // given
      const query = { filter: { lastName: 'Granjean' }, page: {} };
      const request = { query };
      queryParamsUtils.extractParameters.withArgs(query).returns(query);
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });

      // when
      await userController.findPaginatedFilteredUsers(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledWithMatch(query);
    });

    it('should allow to filter users by email', async function() {
      // given
      const query = { filter: { email: 'alexiagranjean' }, page: {} };
      const request = { query };
      queryParamsUtils.extractParameters.withArgs(query).returns(query);
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });

      // when
      await userController.findPaginatedFilteredUsers(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledWithMatch(query);
    });

    it('should allow to paginate on a given page and page size', async function() {
      // given
      const query = { filter: { email: 'alexiagranjean' }, page: { number: 2, size: 25 } };
      const request = { query };
      queryParamsUtils.extractParameters.withArgs(query).returns(query);
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });

      // when
      await userController.findPaginatedFilteredUsers(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledWithMatch(query);
    });
  });

  describe('#getCampaignParticipations', function() {
    const userId = '1';

    const request = {
      auth: {
        credentials: {
          userId: userId,
        },
      },
      params: {
        id: userId,
      },
    };

    beforeEach(function() {
      sinon.stub(campaignParticipationSerializer, 'serialize');
      sinon.stub(usecases, 'findLatestOngoingUserCampaignParticipations');
    });

    it('should return serialized campaignParticipations', async function() {
      // given
      usecases.findLatestOngoingUserCampaignParticipations.withArgs({ userId }).resolves([]);
      campaignParticipationSerializer.serialize.withArgs([]).returns({});

      // when
      const response = await userController.getCampaignParticipations(request, hFake);

      // then
      expect(response).to.deep.equal({});
    });
  });

  describe('#getCampaignParticipationOverviews', function() {
    const userId = '1';

    beforeEach(function() {
      sinon.stub(campaignParticipationOverviewSerializer, 'serialize');
      sinon.stub(campaignParticipationOverviewSerializer, 'serializeForPaginatedList');
      sinon.stub(usecases, 'findUserCampaignParticipationOverviews');
    });

    it('should return serialized campaignParticipationOverviews', async function() {
      // given
      const request = {
        auth: {
          credentials: {
            userId: userId,
          },
        },
        params: {
          id: userId,
        },
      };
      usecases.findUserCampaignParticipationOverviews.withArgs({ userId, states: undefined, page: {} }).resolves([]);
      campaignParticipationOverviewSerializer.serializeForPaginatedList.withArgs([]).returns({
        id: 'campaignParticipationOverviews',
      });

      // when
      const response = await userController.getCampaignParticipationOverviews(request, hFake);

      // then
      expect(response).to.deep.equal({
        id: 'campaignParticipationOverviews',
      });
      expect(campaignParticipationOverviewSerializer.serializeForPaginatedList).to.have.been.calledOnce;
    });

    it('should forward state and page query parameters', async function() {
      // given
      const request = {
        auth: {
          credentials: {
            userId: userId,
          },
        },
        params: {
          id: userId,
        },
        query: { 'filter[states][]': 'ONGOING', 'page[number]': 1, 'page[size]': 10 },
      };
      usecases.findUserCampaignParticipationOverviews.withArgs({ userId, states: 'ONGOING', page: { number: 1, size: 10 } }).resolves([]);
      campaignParticipationOverviewSerializer.serializeForPaginatedList.withArgs([]).returns({
        id: 'campaignParticipationOverviews',
      });

      // when
      const response = await userController.getCampaignParticipationOverviews(request, hFake);

      // then
      expect(response).to.deep.equal({
        id: 'campaignParticipationOverviews',
      });
      expect(campaignParticipationOverviewSerializer.serializeForPaginatedList).to.have.been.calledOnce;
    });
  });

  describe('#isCertifiable', function() {

    beforeEach(function() {
      sinon.stub(usecases, 'isUserCertifiable').resolves(new PlacementProfile());
    });

    it('should return wether the user is certifiable', async function() {
      // given
      const userId = '76';
      const request = {
        auth: {
          credentials: {
            userId,
          },
        },
        params: {
          id: userId,
        },
      };

      // when
      await userController.isCertifiable(request);

      // then
      expect(usecases.isUserCertifiable).to.have.been.calledWith({ userId });
    });
  });

  describe('#getProfile', function() {

    beforeEach(function() {
      sinon.stub(usecases, 'getUserProfile').resolves({
        pixScore: 3,
        scorecards: [],
      });
      sinon.stub(profileSerializer, 'serialize').resolves();
    });

    it('should call the expected usecase', async function() {
      // given
      const userId = '12';
      const locale = 'fr';

      const request = {
        auth: {
          credentials: {
            userId,
          },
        },
        params: {
          id: userId,
        },
        headers: { 'accept-language': locale },
      };

      // when
      await userController.getProfile(request);

      // then
      expect(usecases.getUserProfile).to.have.been.calledWith({ userId, locale });
    });
  });

  describe('#resetScorecard', function() {

    beforeEach(function() {
      sinon.stub(usecases, 'resetScorecard').resolves({
        name: 'Comp1',
      });
      sinon.stub(scorecardSerializer, 'serialize').resolves();
    });

    it('should call the expected usecase', async function() {
      // given
      const userId = '12';
      const competenceId = '875432';

      const request = {
        auth: {
          credentials: {
            userId,
          },
        },
        params: {
          userId,
          competenceId,
        },
      };

      // when
      await userController.resetScorecard(request);

      // then
      expect(usecases.resetScorecard).to.have.been.calledWith({ userId, competenceId });
    });
  });

  describe('#getUserCampaignParticipationToCampaign', function() {
    const userId = 789;
    const campaignId = 456;
    const campaignParticipation = Symbol('campaign participation');
    const expectedCampaignParticipation = Symbol('expected campaign participation');

    const request = {
      auth: {
        credentials: {
          userId,
        },
      },
      params: {
        userId,
        campaignId,

      },
    };

    beforeEach(function() {
      sinon.stub(campaignParticipationSerializer, 'serialize');
      sinon.stub(usecases, 'getUserCampaignParticipationToCampaign');
    });

    it('should return serialized campaign participation', async function() {
      // given
      usecases.getUserCampaignParticipationToCampaign.withArgs({ userId, campaignId }).resolves(campaignParticipation);
      campaignParticipationSerializer.serialize.withArgs(campaignParticipation).returns(expectedCampaignParticipation);

      // when
      const response = await userController.getUserCampaignParticipationToCampaign(request, hFake);

      // then
      expect(response).to.equal(expectedCampaignParticipation);
    });
  });

  describe('#anonymizeUser', function() {

    const userId = 1;
    const request = {
      auth: {
        credentials: {
          userId,
        },
      },
      params: {
        id: userId,
      },
    };

    beforeEach(function() {
      sinon.stub(usecases, 'anonymizeUser').resolves();
    });

    it('should call the anonymize user usecase', async function() {
      // when
      const response = await userController.anonymizeUser(request, hFake);

      // then
      expect(usecases.anonymizeUser).to.have.been.calledWith({ userId });
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#dissociateSchoolingRegistrations', function() {

    const userId = 1;
    const request = {
      auth: { credentials: { userId } },
      params: { id: userId },
    };

    beforeEach(function() {
      sinon.stub(usecases, 'dissociateSchoolingRegistrations');
      sinon.stub(userDetailsForAdminSerializer, 'serialize').resolves();
    });

    it('should call the dissociate schooling registrations usecase', async function() {
      // given
      usecases.dissociateSchoolingRegistrations.resolves({ id: userId });

      // when
      await userController.dissociateSchoolingRegistrations(request, hFake);

      // then
      expect(usecases.dissociateSchoolingRegistrations).to.have.been.calledWith({ userId });
      expect(usecases.dissociateSchoolingRegistrations).to.have.been.calledWith({ userId });
    });
  });

});
