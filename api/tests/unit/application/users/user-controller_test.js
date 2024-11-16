import { userController } from '../../../../lib/application/users/user-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
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

  describe('#rememberUserHasSeenAssessmentInstructions', function () {
    let request;
    const userId = 1;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId } },
        params: { id: userId },
      };

      sinon.stub(usecases, 'rememberUserHasSeenAssessmentInstructions');
    });

    it('should remember user has seen assessment instructions', async function () {
      // given
      usecases.rememberUserHasSeenAssessmentInstructions.withArgs({ userId }).resolves({});
      userSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await userController.rememberUserHasSeenAssessmentInstructions(request, hFake, {
        userSerializer,
      });

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
