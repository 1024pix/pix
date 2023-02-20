import { sinon, expect, domainBuilder, hFake } from '../../../test-helper';
import User from '../../../../lib/domain/models/User';
import AuthenticationMethod from '../../../../lib/domain/models/AuthenticationMethod';
import queryParamsUtils from '../../../../lib/infrastructure/utils/query-params-utils';
import requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils';
import encryptionService from '../../../../lib/domain/services/encryption-service';
import mailService from '../../../../lib/domain/services/mail-service';
import { getI18n } from '../../../tooling/i18n/i18n';
import usecases from '../../../../lib/domain/usecases';
import campaignParticipationSerializer from '../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-serializer';
import campaignParticipationOverviewSerializer from '../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-overview-serializer';
import scorecardSerializer from '../../../../lib/infrastructure/serializers/jsonapi/scorecard-serializer';
import profileSerializer from '../../../../lib/infrastructure/serializers/jsonapi/profile-serializer';
import userSerializer from '../../../../lib/infrastructure/serializers/jsonapi/user-serializer';
import userForAdminSerializer from '../../../../lib/infrastructure/serializers/jsonapi/user-for-admin-serializer';
import userWithActivitySerializer from '../../../../lib/infrastructure/serializers/jsonapi/user-with-activity-serializer';
import userAnonymizedDetailsForAdminSerializer from '../../../../lib/infrastructure/serializers/jsonapi/user-anonymized-details-for-admin-serializer';
import userDetailsForAdminSerializer from '../../../../lib/infrastructure/serializers/jsonapi/user-details-for-admin-serializer';
import validationErrorSerializer from '../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer';
import updateEmailSerializer from '../../../../lib/infrastructure/serializers/jsonapi/update-email-serializer';
import authenticationMethodsSerializer from '../../../../lib/infrastructure/serializers/jsonapi/authentication-methods-serializer';
import userOrganizationForAdminSerializer from '../../../../lib/infrastructure/serializers/jsonapi/user-organization-for-admin-serializer';
import certificationCenterMembershipSerializer from '../../../../lib/infrastructure/serializers/jsonapi/certification-center-membership-serializer';
import trainingSerializer from '../../../../lib/infrastructure/serializers/jsonapi/training-serializer';
import userController from '../../../../lib/application/users/user-controller';
import UserOrganizationForAdmin from '../../../../lib/domain/read-models/UserOrganizationForAdmin';

describe('Unit | Controller | user-controller', function () {
  describe('#save', function () {
    const email = 'to-be-free@ozone.airplane';
    const password = 'Password123';

    const deserializedUser = new User();
    const savedUser = new User({ email });
    const locale = 'fr-fr';

    beforeEach(function () {
      sinon.stub(userSerializer, 'deserialize').returns(deserializedUser);
      sinon.stub(userSerializer, 'serialize');
      sinon.stub(validationErrorSerializer, 'serialize');
      sinon.stub(encryptionService, 'hashPassword');
      sinon.stub(mailService, 'sendAccountCreationEmail');
      sinon.stub(usecases, 'createUser').resolves(savedUser);
    });

    describe('when request is valid', function () {
      it('should return a serialized user and a 201 status code', async function () {
        // given
        const expectedSerializedUser = { message: 'serialized user' };
        userSerializer.serialize.returns(expectedSerializedUser);

        // when
        const response = await userController.save(
          {
            payload: {
              data: {
                attributes: {
                  'first-name': 'John',
                  'last-name': 'DoDoe',
                  email: 'john.dodoe@example.net',
                  cgu: true,
                  password,
                },
              },
            },
          },
          hFake
        );

        // then
        expect(userSerializer.serialize).to.have.been.calledWith(savedUser);
        expect(response.source).to.deep.equal(expectedSerializedUser);
        expect(response.statusCode).to.equal(201);
      });

      it('should call the user creation usecase', async function () {
        // given
        const useCaseParameters = {
          user: deserializedUser,
          password,
          locale,
          campaignCode: null,
        };

        // when
        await userController.save(
          {
            payload: {
              data: {
                attributes: {
                  'first-name': 'John',
                  'last-name': 'DoDoe',
                  email: 'john.dodoe@example.net',
                  cgu: true,
                  password,
                },
              },
            },
          },
          hFake
        );

        // then
        expect(usecases.createUser).to.have.been.calledWith(useCaseParameters);
      });
    });
  });

  describe('#updatePassword', function () {
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

    beforeEach(function () {
      sinon.stub(usecases, 'updateUserPassword');
      sinon.stub(userSerializer, 'serialize');
      sinon.stub(userSerializer, 'deserialize');
    });

    it('should update password', async function () {
      // given
      userSerializer.deserialize.withArgs(payload).returns({ password: userPassword, temporaryKey: userTemporaryKey });
      usecases.updateUserPassword
        .withArgs({
          userId,
          password: userPassword,
          temporaryKey: userTemporaryKey,
        })
        .resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.updatePassword(request);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#updateUserDetailsForAdministration', function () {
    const userId = 1132;
    const newEmail = 'partiel@update.com';

    beforeEach(function () {
      sinon.stub(usecases, 'updateUserDetailsForAdministration');
      sinon.stub(userDetailsForAdminSerializer, 'serializeForUpdate');
      sinon.stub(userDetailsForAdminSerializer, 'deserialize');
    });

    it('should update email,firstName,lastName', async function () {
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
      userDetailsForAdminSerializer.serializeForUpdate.returns('updated');

      // when
      const response = await userController.updateUserDetailsForAdministration(request);

      // then
      expect(response).to.be.equal('updated');
    });

    it('should update email only', async function () {
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
      userDetailsForAdminSerializer.serializeForUpdate.returns(newEmail);

      // when
      const response = await userController.updateUserDetailsForAdministration(request);

      // then
      expect(response).to.be.equal(newEmail);
    });
  });

  describe('#acceptPixLastTermsOfService', function () {
    let request;
    const userId = 1;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId },
      };

      sinon.stub(usecases, 'acceptPixLastTermsOfService');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should accept pix terms of service', async function () {
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

  describe('#acceptPixOrgaTermsOfService', function () {
    let request;
    const userId = 1;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId },
      };

      sinon.stub(usecases, 'acceptPixOrgaTermsOfService');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should accept pix orga terms of service', async function () {
      // given
      usecases.acceptPixOrgaTermsOfService.withArgs({ userId }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.acceptPixOrgaTermsOfService(request);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#acceptPixCertifTermsOfService', function () {
    it('should accept pix certif terms of service', async function () {
      // given
      const userId = 1;
      sinon.stub(usecases, 'acceptPixCertifTermsOfService');

      // when
      await userController.acceptPixCertifTermsOfService(
        {
          auth: { credentials: { userId } },
          params: { id: userId },
        },
        hFake
      );

      // then
      sinon.assert.calledWith(usecases.acceptPixCertifTermsOfService, { userId: 1 });
    });
  });

  describe('#changeLang', function () {
    let request;
    const userId = 1;
    const lang = 'en';

    beforeEach(function () {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId, lang },
      };

      sinon.stub(usecases, 'changeUserLang');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should modify lang of user', async function () {
      // given
      usecases.changeUserLang.withArgs({ userId, lang }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.changeLang(request);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#rememberUserHasSeenAssessmentInstructions', function () {
    let request;
    const userId = 1;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId },
      };

      sinon.stub(usecases, 'rememberUserHasSeenAssessmentInstructions');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should remember user has seen assessment instructions', async function () {
      // given
      usecases.rememberUserHasSeenAssessmentInstructions.withArgs({ userId }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.rememberUserHasSeenAssessmentInstructions(request);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#rememberUserHasSeenNewDashboardInfo', function () {
    let request;
    const userId = 1;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId },
      };

      sinon.stub(usecases, 'rememberUserHasSeenNewDashboardInfo');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should remember user has seen new dashboard info', async function () {
      // given
      usecases.rememberUserHasSeenNewDashboardInfo.withArgs({ userId }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.rememberUserHasSeenNewDashboardInfo(request);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#rememberUserHasSeenChallengeTooltip', function () {
    let request;
    const userId = 1;
    let challengeType;

    beforeEach(function () {
      sinon.stub(usecases, 'rememberUserHasSeenChallengeTooltip');
      sinon.stub(userSerializer, 'serialize');
    });

    it('should remember user has seen focused challenge tooltip', async function () {
      // given
      challengeType = 'focused';
      request = {
        auth: { credentials: { userId } },
        params: { id: userId, challengeType },
      };

      usecases.rememberUserHasSeenChallengeTooltip.withArgs({ userId, challengeType }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.rememberUserHasSeenChallengeTooltip(request);

      // then
      expect(response).to.be.equal('ok');
    });

    it('should remember user has seen other challenges tooltip', async function () {
      // given
      challengeType = 'other';
      request = {
        auth: { credentials: { userId } },
        params: { id: userId, challengeType },
      };

      usecases.rememberUserHasSeenChallengeTooltip.withArgs({ userId, challengeType }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.rememberUserHasSeenChallengeTooltip(request);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#getCurrentUser', function () {
    it('should get the current user', async function () {
      // given
      const request = { auth: { credentials: { userId: 1 } } };
      const currentUser = Symbol('current-user');
      const getCurrentUserStub = sinon.stub(usecases, 'getCurrentUser');
      const userWithActivitySerializerStub = sinon.stub(userWithActivitySerializer, 'serialize');

      usecases.getCurrentUser.withArgs({ authenticatedUserId: 1 }).resolves(currentUser);
      userWithActivitySerializer.serialize.withArgs(currentUser).returns('ok');

      // when
      const response = await userController.getCurrentUser(request);

      // then
      expect(response).to.be.equal('ok');
      expect(getCurrentUserStub).to.have.been.calledWithExactly({ authenticatedUserId: 1 });
      expect(userWithActivitySerializerStub).to.have.been.calledWithExactly(currentUser);
    });
  });

  describe('#getUserDetailsForAdmin', function () {
    let request;

    beforeEach(function () {
      request = { params: { id: 123 } };

      sinon.stub(usecases, 'getUserDetailsForAdmin');
      sinon.stub(userDetailsForAdminSerializer, 'serialize');
    });

    it('should get the specified user for admin context', async function () {
      // given
      usecases.getUserDetailsForAdmin.withArgs({ userId: 123 }).resolves('userDetail');
      userDetailsForAdminSerializer.serialize.withArgs('userDetail').returns('ok');

      // when
      const response = await userController.getUserDetailsForAdmin(request);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#findPaginatedFilteredUsers', function () {
    beforeEach(function () {
      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(usecases, 'findPaginatedFilteredUsers');
      sinon.stub(userForAdminSerializer, 'serialize');
    });

    it('should return a list of JSON API users fetched from the data repository', async function () {
      // given
      const request = { query: {} };
      queryParamsUtils.extractParameters.withArgs({}).returns({});
      usecases.findPaginatedFilteredUsers.resolves({ models: {}, pagination: {} });
      userForAdminSerializer.serialize.returns({ data: {}, meta: {} });

      // when
      await userController.findPaginatedFilteredUsers(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredUsers).to.have.been.calledOnce;
      expect(userForAdminSerializer.serialize).to.have.been.calledOnce;
    });

    it('should return a JSON API response with pagination information', async function () {
      // given
      const request = { query: {} };
      const expectedResults = [new User({ id: 1 }), new User({ id: 2 }), new User({ id: 3 })];
      const expectedPagination = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4 };
      queryParamsUtils.extractParameters.withArgs({}).returns({});
      usecases.findPaginatedFilteredUsers.resolves({ models: expectedResults, pagination: expectedPagination });

      // when
      await userController.findPaginatedFilteredUsers(request, hFake);

      // then
      expect(userForAdminSerializer.serialize).to.have.been.calledWithExactly(expectedResults, expectedPagination);
    });

    it('should allow to filter users by first name', async function () {
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

    it('should allow to filter users by last name', async function () {
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

    it('should allow to filter users by email', async function () {
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

    it('should allow to paginate on a given page and page size', async function () {
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

  describe('#findPaginatedUserRecommendedTrainings', function () {
    it('should call the appropriate use-case', async function () {
      // given
      const page = Symbol('page');
      const query = Symbol('query');
      const locale = 'fr';
      const request = {
        auth: {
          credentials: {
            userId: 1,
          },
        },
        query,
        headers: { 'accept-language': locale },
      };
      const expectedResult = Symbol('serialized-trainings');
      const userRecommendedTrainings = Symbol('userRecommendedTrainings');
      const meta = Symbol('meta');
      sinon.stub(requestResponseUtils, 'extractLocaleFromRequest').withArgs(request).returns(locale);
      sinon.stub(queryParamsUtils, 'extractParameters').withArgs(query).returns({ page });
      sinon.stub(usecases, 'findPaginatedUserRecommendedTrainings').resolves({ userRecommendedTrainings, meta });
      sinon.stub(trainingSerializer, 'serialize').returns(expectedResult);

      // when
      const response = await userController.findPaginatedUserRecommendedTrainings(request);

      // then
      expect(queryParamsUtils.extractParameters).to.have.been.calledOnce;
      expect(requestResponseUtils.extractLocaleFromRequest).to.have.been.calledOnce;
      expect(usecases.findPaginatedUserRecommendedTrainings).to.have.been.calledOnce;
      expect(usecases.findPaginatedUserRecommendedTrainings).to.have.been.calledWithExactly({
        userId: 1,
        locale,
        page,
      });
      expect(trainingSerializer.serialize).to.have.been.calledWithExactly(userRecommendedTrainings, meta);
      expect(response).to.equal(expectedResult);
    });
  });

  describe('#getCampaignParticipations', function () {
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

    beforeEach(function () {
      sinon.stub(campaignParticipationSerializer, 'serialize');
      sinon.stub(usecases, 'findLatestOngoingUserCampaignParticipations');
    });

    it('should return serialized campaignParticipations', async function () {
      // given
      usecases.findLatestOngoingUserCampaignParticipations.withArgs({ userId }).resolves([]);
      campaignParticipationSerializer.serialize.withArgs([]).returns({});

      // when
      const response = await userController.getCampaignParticipations(request, hFake);

      // then
      expect(response).to.deep.equal({});
    });
  });

  describe('#getCampaignParticipationOverviews', function () {
    const userId = '1';

    beforeEach(function () {
      sinon.stub(campaignParticipationOverviewSerializer, 'serialize');
      sinon.stub(campaignParticipationOverviewSerializer, 'serializeForPaginatedList');
      sinon.stub(usecases, 'findUserCampaignParticipationOverviews');
    });

    it('should return serialized campaignParticipationOverviews', async function () {
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

    it('should forward state and page query parameters', async function () {
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
      usecases.findUserCampaignParticipationOverviews
        .withArgs({ userId, states: 'ONGOING', page: { number: 1, size: 10 } })
        .resolves([]);
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

  describe('#isCertifiable', function () {
    it('should return user certification eligibility', async function () {
      // given
      const certificationEligibility = domainBuilder.buildCertificationEligibility({
        id: 123,
        pixCertificationEligible: true,
        eligibleComplementaryCertifications: ['Pix+ Droit Maître', 'Pix+ Édu 1er degré Avancé'],
      });
      sinon
        .stub(usecases, 'getUserCertificationEligibility')
        .withArgs({ userId: 123 })
        .resolves(certificationEligibility);
      const request = {
        auth: {
          credentials: {
            userId: 123,
          },
        },
      };

      // when
      const serializedEligibility = await userController.isCertifiable(request);

      // then
      expect(serializedEligibility).to.deep.equal({
        data: {
          id: '123',
          type: 'isCertifiables',
          attributes: {
            'is-certifiable': true,
            'eligible-complementary-certifications': ['Pix+ Droit Maître', 'Pix+ Édu 1er degré Avancé'],
          },
        },
      });
    });
  });

  describe('#getProfile', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'getUserProfile').resolves({
        pixScore: 3,
        scorecards: [],
      });
      sinon.stub(profileSerializer, 'serialize').resolves();
    });

    it('should call the expected usecase', async function () {
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

  describe('#getProfileForAdmin', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'getUserProfile').resolves({
        pixScore: 3,
        scorecards: [],
      });
      sinon.stub(profileSerializer, 'serialize').resolves();
    });

    it('should call the expected usecase', async function () {
      // given
      const userId = '12';
      const locale = 'fr';

      const request = {
        params: {
          id: userId,
        },
        headers: { 'accept-language': locale },
      };

      // when
      await userController.getProfileForAdmin(request);

      // then
      expect(usecases.getUserProfile).to.have.been.calledWith({ userId, locale });
    });
  });

  describe('#resetScorecard', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'resetScorecard').resolves({
        name: 'Comp1',
      });
      sinon.stub(scorecardSerializer, 'serialize').resolves();
    });

    it('should call the expected usecase', async function () {
      // given
      const userId = '12';
      const competenceId = '875432';
      const locale = 'fr-fr';

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
      expect(usecases.resetScorecard).to.have.been.calledWith({ userId, competenceId, locale });
    });
  });

  describe('#getUserCampaignParticipationToCampaign', function () {
    const userId = 789;
    const campaignId = 456;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const campaignParticipation = Symbol('campaign participation');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
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

    beforeEach(function () {
      sinon.stub(campaignParticipationSerializer, 'serialize');
      sinon.stub(usecases, 'getUserCampaignParticipationToCampaign');
    });

    it('should return serialized campaign participation', async function () {
      // given
      usecases.getUserCampaignParticipationToCampaign.withArgs({ userId, campaignId }).resolves(campaignParticipation);
      campaignParticipationSerializer.serialize.withArgs(campaignParticipation).returns(expectedCampaignParticipation);

      // when
      const response = await userController.getUserCampaignParticipationToCampaign(request, hFake);

      // then
      expect(response).to.equal(expectedCampaignParticipation);
    });
  });

  describe('#anonymizeUser', function () {
    it('should call the anonymize user usecase', async function () {
      // given
      const userId = 1;
      const updatedByUserId = 2;
      const anonymizedUserSerialized = Symbol('anonymizedUserSerialized');
      const userDetailsForAdmin = Symbol('userDetailsForAdmin');
      sinon.stub(usecases, 'anonymizeUser').resolves(userDetailsForAdmin);
      sinon.stub(userAnonymizedDetailsForAdminSerializer, 'serialize').returns(anonymizedUserSerialized);

      // when
      const response = await userController.anonymizeUser(
        {
          auth: { credentials: { userId: updatedByUserId } },
          params: { id: userId },
        },
        hFake
      );

      // then
      expect(usecases.anonymizeUser).to.have.been.calledWith({ userId, updatedByUserId });
      expect(userAnonymizedDetailsForAdminSerializer.serialize).to.have.been.calledWith(userDetailsForAdmin);
      expect(response.statusCode).to.equal(200);
      expect(response.source).to.deep.equal(anonymizedUserSerialized);
    });
  });

  describe('#sendVerificationCode', function () {
    it('should call the usecase to send verification code with code, email and locale', async function () {
      // given
      sinon.stub(usecases, 'sendVerificationCode');
      usecases.sendVerificationCode.resolves();
      const i18n = getI18n();
      const userId = 1;
      const locale = 'fr';
      const newEmail = 'user@example.net';
      const password = 'Password123';

      const request = {
        headers: { 'accept-language': locale },
        i18n,
        auth: {
          credentials: {
            userId,
          },
        },
        params: {
          id: userId,
        },
        payload: {
          data: {
            type: 'users',
            attributes: {
              newEmail,
              password,
            },
          },
        },
      };

      // when
      await userController.sendVerificationCode(request, hFake);

      // then
      expect(usecases.sendVerificationCode).to.have.been.calledWith({
        i18n,
        locale,
        newEmail,
        password,
        userId,
      });
    });
  });

  describe('#updateUserEmailWithValidation', function () {
    it('should call the usecase to update user email', async function () {
      // given
      const userId = 1;
      const updatedEmail = 'new-email@example.net';
      const code = '999999';

      const responseSerialized = Symbol('an response serialized');
      sinon.stub(usecases, 'updateUserEmailWithValidation');
      sinon.stub(updateEmailSerializer, 'serialize');

      usecases.updateUserEmailWithValidation.withArgs({ code, userId }).resolves(updatedEmail);
      updateEmailSerializer.serialize.withArgs(updatedEmail).returns(responseSerialized);

      const request = {
        auth: {
          credentials: {
            userId,
          },
        },
        params: {
          id: userId,
        },
        payload: {
          data: {
            type: 'users',
            attributes: {
              code,
            },
          },
        },
      };

      // when
      const response = await userController.updateUserEmailWithValidation(request);

      // then
      expect(usecases.updateUserEmailWithValidation).to.have.been.calledWith({
        code,
        userId,
      });
      expect(response).to.deep.equal(responseSerialized);
    });
  });

  describe('#getUserAuthenticationMethods', function () {
    it('should call the usecase to find user authentication methods', async function () {
      // given
      const user = domainBuilder.buildUser();
      const authenticationMethods = [
        domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId: user.id }),
      ];

      const responseSerialized = Symbol('an response serialized');
      sinon.stub(usecases, 'findUserAuthenticationMethods');
      sinon.stub(authenticationMethodsSerializer, 'serialize');

      usecases.findUserAuthenticationMethods.withArgs({ userId: user.id }).resolves(authenticationMethods);
      authenticationMethodsSerializer.serialize.withArgs(authenticationMethods).returns(responseSerialized);

      const request = {
        auth: {
          credentials: {
            userId: user.id,
          },
        },
        params: {
          id: user.id,
        },
      };

      // when
      const response = await userController.getUserAuthenticationMethods(request);

      // then
      expect(response).to.deep.equal(responseSerialized);
    });
  });

  describe('#addPixAuthenticationMethodByEmail', function () {
    it('should return the user with the new pix authentication method by user email', async function () {
      // given
      const email = '    USER@example.net    ';
      const user = domainBuilder.buildUser();
      const updatedUser = domainBuilder.buildUser({ ...user, email: 'user@example.net' });
      const updatedUserSerialized = Symbol('the user with a new email and serialized');
      sinon
        .stub(usecases, 'addPixAuthenticationMethodByEmail')
        .withArgs({ userId: user.id, email: 'user@example.net' })
        .resolves(updatedUser);
      sinon.stub(userDetailsForAdminSerializer, 'serialize').withArgs(updatedUser).returns(updatedUserSerialized);

      // when
      const request = {
        auth: {
          credentials: {
            userId: user.id,
          },
        },
        params: {
          id: user.id,
        },
        payload: {
          data: {
            attributes: {
              email,
            },
          },
        },
      };
      const result = await userController.addPixAuthenticationMethodByEmail(request, hFake);

      // then
      expect(result.source).to.be.equal(updatedUserSerialized);
    });
  });

  describe('#reassignAuthenticationMethods', function () {
    context('when the reassigned authentication method is gar', function () {
      it('should update gar authentication method user id', async function () {
        // given
        const originUserId = domainBuilder.buildUser({ id: 1 }).id;
        const targetUserId = domainBuilder.buildUser({ id: 2 }).id;
        const authenticationMethodId = 123;

        sinon
          .stub(usecases, 'reassignAuthenticationMethodToAnotherUser')
          .withArgs({ originUserId, targetUserId, authenticationMethodId })
          .resolves();

        // when
        const request = {
          auth: {
            credentials: {
              userId: originUserId,
            },
          },
          params: {
            userId: originUserId,
            authenticationMethodId,
          },
          payload: {
            data: {
              attributes: {
                'user-id': targetUserId,
                'identity-provider': AuthenticationMethod.identityProviders.GAR,
              },
            },
          },
        };
        await userController.reassignAuthenticationMethods(request, hFake);

        // then
        expect(usecases.reassignAuthenticationMethodToAnotherUser).to.have.been.calledWith({
          originUserId,
          targetUserId,
          authenticationMethodId,
        });
      });
    });
  });

  describe('#findUserOrganizationsForAdmin', function () {
    it('should return user’s organization memberships', async function () {
      // given
      const organizationMemberships = [new UserOrganizationForAdmin()];
      const organizationMembershipsSerialized = Symbol('an array of user’s organization memberships serialized');

      sinon
        .stub(userOrganizationForAdminSerializer, 'serialize')
        .withArgs(organizationMemberships)
        .returns(organizationMembershipsSerialized);

      sinon.stub(usecases, 'findUserOrganizationsForAdmin').resolves(organizationMemberships);

      // when
      const request = {
        params: {
          id: 1,
        },
      };
      await userController.findUserOrganizationsForAdmin(request, hFake);

      // then
      expect(usecases.findUserOrganizationsForAdmin).to.have.been.calledWith({ userId: 1 });
    });
  });

  describe('#findCertificationCenterMembershipsByUser', function () {
    it("should return user's certification centers", async function () {
      // given
      const certificationCenterMemberships = Symbol("a list of user's certification center memberships");
      const certificationCenterMembershipsSerialized = Symbol(
        "a list of user's certification center memberships serialized"
      );

      sinon
        .stub(certificationCenterMembershipSerializer, 'serializeForAdmin')
        .withArgs(certificationCenterMemberships)
        .returns(certificationCenterMembershipsSerialized);

      sinon
        .stub(usecases, 'findCertificationCenterMembershipsByUser')
        .withArgs({ userId: 12345 })
        .resolves(certificationCenterMemberships);

      // when
      const request = {
        params: {
          id: 12345,
        },
      };
      const result = await userController.findCertificationCenterMembershipsByUser(request, hFake);

      // then
      expect(result.source).to.equal(certificationCenterMembershipsSerialized);
    });
  });

  describe('#rememberUserHasSeenLastDataProtectionPolicyInformation', function () {
    it('should remember user has seen last data protection policy information', async function () {
      // given
      sinon.stub(usecases, 'rememberUserHasSeenLastDataProtectionPolicyInformation');
      usecases.rememberUserHasSeenLastDataProtectionPolicyInformation.withArgs({ userId: 1 }).resolves({});
      sinon.stub(userSerializer, 'serialize');
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.rememberUserHasSeenLastDataProtectionPolicyInformation({
        auth: { credentials: { userId: 1 } },
        params: { id: 1 },
      });

      // then
      expect(response).to.be.equal('ok');
    });
  });
});
