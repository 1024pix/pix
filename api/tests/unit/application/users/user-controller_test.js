import { userController } from '../../../../lib/application/users/user-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { usecases as devcompUsecases } from '../../../../src/devcomp/domain/usecases/index.js';
import { evaluationUsecases } from '../../../../src/evaluation/domain/usecases/index.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { UserOrganizationForAdmin } from '../../../../src/shared/domain/read-models/UserOrganizationForAdmin.js';
import * as requestResponseUtils from '../../../../src/shared/infrastructure/utils/request-response-utils.js';
import { domainBuilder, expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Controller | user-controller', function () {
  let userSerializer;

  beforeEach(function () {
    userSerializer = {
      deserialize: sinon.stub(),
      serialize: sinon.stub(),
    };
  });

  describe('#rememberUserHasSeenChallengeTooltip', function () {
    let request;
    const userId = 1;
    let challengeType;

    beforeEach(function () {
      sinon.stub(usecases, 'rememberUserHasSeenChallengeTooltip');
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
      const response = await userController.rememberUserHasSeenChallengeTooltip(request, hFake, { userSerializer });

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
      const response = await userController.rememberUserHasSeenChallengeTooltip(request, hFake, { userSerializer });

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#getUserDetailsForAdmin', function () {
    let request;
    let dependencies;

    beforeEach(function () {
      request = { params: { id: 123 } };

      sinon.stub(usecases, 'getUserDetailsForAdmin');
      const userDetailsForAdminSerializer = { serialize: sinon.stub() };
      dependencies = { userDetailsForAdminSerializer };
    });

    it('should get the specified user for admin context', async function () {
      // given
      usecases.getUserDetailsForAdmin.withArgs({ userId: 123 }).resolves('userDetail');
      dependencies.userDetailsForAdminSerializer.serialize.withArgs('userDetail').returns('ok');

      // when
      const response = await userController.getUserDetailsForAdmin(request, hFake, dependencies);

      // then
      expect(response).to.be.equal('ok');
    });
  });

  describe('#findPaginatedUserRecommendedTrainings', function () {
    it('should call the appropriate use-case', async function () {
      // given
      const page = Symbol('page');
      const locale = 'fr';
      const request = {
        auth: {
          credentials: {
            userId: 1,
          },
        },
        query: { page },
        headers: { 'accept-language': locale },
      };
      const expectedResult = Symbol('serialized-trainings');
      const userRecommendedTrainings = Symbol('userRecommendedTrainings');
      const meta = Symbol('meta');
      const requestResponseUtils = { extractLocaleFromRequest: sinon.stub() };
      requestResponseUtils.extractLocaleFromRequest.withArgs(request).returns(locale);
      sinon.stub(devcompUsecases, 'findPaginatedUserRecommendedTrainings').resolves({ userRecommendedTrainings, meta });
      const trainingSerializer = { serialize: sinon.stub() };
      trainingSerializer.serialize.returns(expectedResult);

      // when
      const response = await userController.findPaginatedUserRecommendedTrainings(request, hFake, {
        requestResponseUtils,
        devcompUsecases,
        trainingSerializer,
      });

      // then
      expect(requestResponseUtils.extractLocaleFromRequest).to.have.been.calledOnce;
      expect(devcompUsecases.findPaginatedUserRecommendedTrainings).to.have.been.calledOnce;
      expect(devcompUsecases.findPaginatedUserRecommendedTrainings).to.have.been.calledWithExactly({
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
      sinon.stub(usecases, 'findLatestOngoingUserCampaignParticipations');
    });

    it('should return serialized campaignParticipations', async function () {
      // given
      const campaignParticipationSerializer = { serialize: sinon.stub() };
      usecases.findLatestOngoingUserCampaignParticipations.withArgs({ userId }).resolves([]);
      campaignParticipationSerializer.serialize.withArgs([]).returns({});

      // when
      const response = await userController.getCampaignParticipations(request, hFake, {
        campaignParticipationSerializer,
      });

      // then
      expect(response).to.deep.equal({});
    });
  });

  describe('#getCampaignParticipationOverviews', function () {
    const userId = '1';
    let dependencies;

    beforeEach(function () {
      const campaignParticipationOverviewSerializer = {
        serialize: sinon.stub(),
        serializeForPaginatedList: sinon.stub(),
      };
      sinon.stub(usecases, 'findUserCampaignParticipationOverviews');
      dependencies = {
        campaignParticipationOverviewSerializer,
      };
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
        query: { filter: {}, page: {} },
      };
      usecases.findUserCampaignParticipationOverviews.withArgs({ userId, states: undefined, page: {} }).resolves([]);
      dependencies.campaignParticipationOverviewSerializer.serializeForPaginatedList.withArgs([]).returns({
        id: 'campaignParticipationOverviews',
      });

      // when
      const response = await userController.getCampaignParticipationOverviews(request, hFake, dependencies);

      // then
      expect(response).to.deep.equal({
        id: 'campaignParticipationOverviews',
      });
      expect(dependencies.campaignParticipationOverviewSerializer.serializeForPaginatedList).to.have.been.calledOnce;
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
        query: {
          filter: {
            states: 'ONGOING',
          },
          page: { number: 1, size: 10 },
        },
      };
      usecases.findUserCampaignParticipationOverviews
        .withArgs({ userId, states: 'ONGOING', page: { number: 1, size: 10 } })
        .resolves([]);
      dependencies.campaignParticipationOverviewSerializer.serializeForPaginatedList.withArgs([]).returns({
        id: 'campaignParticipationOverviews',
      });

      // when
      const response = await userController.getCampaignParticipationOverviews(request, hFake, dependencies);

      // then
      expect(response).to.deep.equal({
        id: 'campaignParticipationOverviews',
      });
      expect(dependencies.campaignParticipationOverviewSerializer.serializeForPaginatedList).to.have.been.calledOnce;
    });
  });

  describe('#resetScorecard', function () {
    beforeEach(function () {
      sinon.stub(evaluationUsecases, 'resetScorecard').resolves({
        name: 'Comp1',
      });
    });

    it('should call the expected usecase', async function () {
      // given
      const scorecardSerializer = { serialize: sinon.stub() };
      scorecardSerializer.serialize.resolves();
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
      await userController.resetScorecard(request, hFake, { scorecardSerializer, requestResponseUtils });

      // then
      expect(evaluationUsecases.resetScorecard).to.have.been.calledWithExactly({ userId, competenceId, locale });
    });
  });

  describe('#getUserCampaignParticipationToCampaign', function () {
    it('should return serialized campaign participation', async function () {
      // given
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
      const campaignParticipationSerializer = { serialize: sinon.stub() };
      sinon.stub(usecases, 'getUserCampaignParticipationToCampaign');
      usecases.getUserCampaignParticipationToCampaign.withArgs({ userId, campaignId }).resolves(campaignParticipation);
      campaignParticipationSerializer.serialize.withArgs(campaignParticipation).returns(expectedCampaignParticipation);

      // when
      const response = await userController.getUserCampaignParticipationToCampaign(request, hFake, {
        campaignParticipationSerializer,
      });

      // then
      expect(response).to.equal(expectedCampaignParticipation);
    });
  });

  describe('#anonymizeUser', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now: new Date('2023-08-17'), toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should call the anonymize user usecase', async function () {
      // given
      const userId = 1;
      const updatedByUserId = 2;
      const anonymizedUserSerialized = Symbol('anonymizedUserSerialized');
      const userDetailsForAdmin = Symbol('userDetailsForAdmin');
      const domainTransaction = {
        knexTransaction: Symbol('transaction'),
      };
      sinon.stub(usecases, 'anonymizeUser');
      sinon.stub(usecases, 'getUserDetailsForAdmin').resolves(userDetailsForAdmin);
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback(domainTransaction);
      });
      const userAnonymizedDetailsForAdminSerializer = { serialize: sinon.stub() };
      userAnonymizedDetailsForAdminSerializer.serialize.returns(anonymizedUserSerialized);

      // when
      const response = await userController.anonymizeUser(
        {
          auth: { credentials: { userId: updatedByUserId } },
          params: { id: userId },
        },
        hFake,
        { userAnonymizedDetailsForAdminSerializer },
      );

      // then
      expect(DomainTransaction.execute).to.have.been.called;
      expect(usecases.anonymizeUser).to.have.been.calledWithExactly({ userId, updatedByUserId, domainTransaction });
      expect(usecases.getUserDetailsForAdmin).to.have.been.calledWithExactly({ userId });
      expect(userAnonymizedDetailsForAdminSerializer.serialize).to.have.been.calledWithExactly(userDetailsForAdmin);
      expect(response.statusCode).to.equal(200);
      expect(response.source).to.deep.equal(anonymizedUserSerialized);
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
      const userDetailsForAdminSerializer = { serialize: sinon.stub() };
      userDetailsForAdminSerializer.serialize.withArgs(updatedUser).returns(updatedUserSerialized);

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
      const result = await userController.addPixAuthenticationMethodByEmail(request, hFake, {
        userDetailsForAdminSerializer,
      });

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
                'identity-provider': NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
              },
            },
          },
        };
        await userController.reassignAuthenticationMethods(request, hFake);

        // then
        expect(usecases.reassignAuthenticationMethodToAnotherUser).to.have.been.calledWithExactly({
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

      const userOrganizationForAdminSerializer = { serialize: sinon.stub() };
      userOrganizationForAdminSerializer.serialize
        .withArgs(organizationMemberships)
        .returns(organizationMembershipsSerialized);

      sinon.stub(usecases, 'findUserOrganizationsForAdmin').resolves(organizationMemberships);

      // when
      const request = {
        params: {
          id: 1,
        },
      };
      await userController.findUserOrganizationsForAdmin(request, hFake, { userOrganizationForAdminSerializer });

      // then
      expect(usecases.findUserOrganizationsForAdmin).to.have.been.calledWithExactly({ userId: 1 });
    });
  });

  describe('#findCertificationCenterMembershipsByUser', function () {
    it("should return user's certification centers", async function () {
      // given
      const certificationCenterMemberships = Symbol("a list of user's certification center memberships");
      const certificationCenterMembershipsSerialized = Symbol(
        "a list of user's certification center memberships serialized",
      );

      const certificationCenterMembershipSerializer = { serializeForAdmin: sinon.stub() };
      certificationCenterMembershipSerializer.serializeForAdmin
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
      const result = await userController.findCertificationCenterMembershipsByUser(request, hFake, {
        certificationCenterMembershipSerializer,
      });

      // then
      expect(result.source).to.equal(certificationCenterMembershipsSerialized);
    });
  });
});
