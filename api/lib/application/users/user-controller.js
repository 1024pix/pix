import campaignParticipationSerializer from '../../infrastructure/serializers/jsonapi/campaign-participation-serializer';
import campaignParticipationOverviewSerializer from '../../infrastructure/serializers/jsonapi/campaign-participation-overview-serializer';
import certificationEligibilitySerializer from '../../infrastructure/serializers/jsonapi/certification-eligibility-serializer';
import scorecardSerializer from '../../infrastructure/serializers/jsonapi/scorecard-serializer';
import profileSerializer from '../../infrastructure/serializers/jsonapi/profile-serializer';
import participantResultSerializer from '../../infrastructure/serializers/jsonapi/participant-result-serializer';
import sharedProfileForCampaignSerializer from '../../infrastructure/serializers/jsonapi/shared-profile-for-campaign-serializer';
import userSerializer from '../../infrastructure/serializers/jsonapi/user-serializer';
import userForAdminSerializer from '../../infrastructure/serializers/jsonapi/user-for-admin-serializer';
import userWithActivitySerializer from '../../infrastructure/serializers/jsonapi/user-with-activity-serializer';
import emailVerificationSerializer from '../../infrastructure/serializers/jsonapi/email-verification-serializer';
import userDetailsForAdminSerializer from '../../infrastructure/serializers/jsonapi/user-details-for-admin-serializer';
import userAnonymizedDetailsForAdminSerializer from '../../infrastructure/serializers/jsonapi/user-anonymized-details-for-admin-serializer';
import updateEmailSerializer from '../../infrastructure/serializers/jsonapi/update-email-serializer';
import authenticationMethodsSerializer from '../../infrastructure/serializers/jsonapi/authentication-methods-serializer';
import campaignParticipationForUserManagementSerializer from '../../infrastructure/serializers/jsonapi/campaign-participation-for-user-management-serializer';
import userOrganizationForAdminSerializer from '../../infrastructure/serializers/jsonapi/user-organization-for-admin-serializer';
import certificationCenterMembershipSerializer from '../../infrastructure/serializers/jsonapi/certification-center-membership-serializer';
import trainingSerializer from '../../infrastructure/serializers/jsonapi/training-serializer';
import userLoginSerializer from '../../infrastructure/serializers/jsonapi/user-login-serializer';
import queryParamsUtils from '../../infrastructure/utils/query-params-utils';
import requestResponseUtils from '../../infrastructure/utils/request-response-utils';
import usecases from '../../domain/usecases';

export default {
  save(request, h) {
    const campaignCode = request.payload.meta ? request.payload.meta['campaign-code'] : null;
    const user = userSerializer.deserialize(request.payload);
    const locale = requestResponseUtils.extractLocaleFromRequest(request);

    const password = request.payload.data.attributes.password;

    return usecases
      .createUser({
        user,
        password,
        campaignCode,
        locale,
      })
      .then((savedUser) => {
        return h.response(userSerializer.serialize(savedUser)).created();
      });
  },

  getCurrentUser(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    return usecases.getCurrentUser({ authenticatedUserId }).then(userWithActivitySerializer.serialize);
  },

  async getUserDetailsForAdmin(request) {
    const userId = request.params.id;
    const userDetailsForAdmin = await usecases.getUserDetailsForAdmin({ userId });
    return userDetailsForAdminSerializer.serialize(userDetailsForAdmin);
  },

  async updatePassword(request) {
    const userId = request.params.id;
    const password = request.payload.data.attributes.password;

    const updatedUser = await usecases.updateUserPassword({
      userId,
      password,
      temporaryKey: request.query['temporary-key'] || '',
    });

    return userSerializer.serialize(updatedUser);
  },

  async updateUserDetailsForAdministration(request) {
    const userId = request.params.id;
    const userDetailsForAdministration = userDetailsForAdminSerializer.deserialize(request.payload);

    const updatedUser = await usecases.updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration,
    });

    return userDetailsForAdminSerializer.serializeForUpdate(updatedUser);
  },

  async acceptPixLastTermsOfService(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.acceptPixLastTermsOfService({
      userId: authenticatedUserId,
    });

    return userSerializer.serialize(updatedUser);
  },

  async changeLang(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const lang = request.params.lang;
    const updatedUser = await usecases.changeUserLang({
      userId: authenticatedUserId,
      lang,
    });

    return userSerializer.serialize(updatedUser);
  },

  async acceptPixOrgaTermsOfService(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.acceptPixOrgaTermsOfService({
      userId: authenticatedUserId,
    });

    return userSerializer.serialize(updatedUser);
  },

  async acceptPixCertifTermsOfService(request, h) {
    const authenticatedUserId = request.auth.credentials.userId;

    await usecases.acceptPixCertifTermsOfService({
      userId: authenticatedUserId,
    });

    return h.response().code(204);
  },

  async rememberUserHasSeenAssessmentInstructions(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.rememberUserHasSeenAssessmentInstructions({ userId: authenticatedUserId });
    return userSerializer.serialize(updatedUser);
  },

  async rememberUserHasSeenNewDashboardInfo(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.rememberUserHasSeenNewDashboardInfo({ userId: authenticatedUserId });
    return userSerializer.serialize(updatedUser);
  },

  async rememberUserHasSeenChallengeTooltip(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const challengeType = request.params.challengeType;

    const updatedUser = await usecases.rememberUserHasSeenChallengeTooltip({
      userId: authenticatedUserId,
      challengeType,
    });
    return userSerializer.serialize(updatedUser);
  },

  async findPaginatedFilteredUsers(request) {
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: users, pagination } = await usecases.findPaginatedFilteredUsers({
      filter: options.filter,
      page: options.page,
    });
    return userForAdminSerializer.serialize(users, pagination);
  },

  async findPaginatedUserRecommendedTrainings(request) {
    const locale = requestResponseUtils.extractLocaleFromRequest(request);
    const { page } = queryParamsUtils.extractParameters(request.query);
    const { userRecommendedTrainings, meta } = await usecases.findPaginatedUserRecommendedTrainings({
      userId: request.auth.credentials.userId,
      locale,
      page,
    });

    return trainingSerializer.serialize(userRecommendedTrainings, meta);
  },

  getCampaignParticipations(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases
      .findLatestOngoingUserCampaignParticipations({ userId: authenticatedUserId })
      .then(campaignParticipationSerializer.serialize);
  },

  async getCampaignParticipationOverviews(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const query = queryParamsUtils.extractParameters(request.query);

    const userCampaignParticipationOverviews = await usecases.findUserCampaignParticipationOverviews({
      userId: authenticatedUserId,
      states: query.filter.states,
      page: query.page,
    });

    return campaignParticipationOverviewSerializer.serializeForPaginatedList(userCampaignParticipationOverviews);
  },

  async isCertifiable(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const certificationEligibility = await usecases.getUserCertificationEligibility({ userId: authenticatedUserId });
    return certificationEligibilitySerializer.serialize(certificationEligibility);
  },

  getProfile(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const locale = requestResponseUtils.extractLocaleFromRequest(request);

    return usecases.getUserProfile({ userId: authenticatedUserId, locale }).then(profileSerializer.serialize);
  },

  getProfileForAdmin(request) {
    const userId = request.params.id;
    const locale = requestResponseUtils.extractLocaleFromRequest(request);

    return usecases.getUserProfile({ userId, locale }).then(profileSerializer.serialize);
  },

  resetScorecard(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const competenceId = request.params.competenceId;
    const locale = requestResponseUtils.extractLocaleFromRequest(request);

    return usecases
      .resetScorecard({ userId: authenticatedUserId, competenceId, locale })
      .then(scorecardSerializer.serialize);
  },

  getUserCampaignParticipationToCampaign(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const campaignId = request.params.campaignId;

    return usecases
      .getUserCampaignParticipationToCampaign({ userId: authenticatedUserId, campaignId })
      .then((campaignParticipation) => campaignParticipationSerializer.serialize(campaignParticipation));
  },

  async getUserProfileSharedForCampaign(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const campaignId = request.params.campaignId;
    const locale = requestResponseUtils.extractLocaleFromRequest(request);

    const sharedProfileForCampaign = await usecases.getUserProfileSharedForCampaign({
      userId: authenticatedUserId,
      campaignId,
      locale,
    });

    return sharedProfileForCampaignSerializer.serialize(sharedProfileForCampaign);
  },

  async getUserCampaignAssessmentResult(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const campaignId = request.params.campaignId;
    const locale = requestResponseUtils.extractLocaleFromRequest(request);

    const campaignAssessmentResult = await usecases.getUserCampaignAssessmentResult({
      userId: authenticatedUserId,
      campaignId,
      locale,
    });

    return participantResultSerializer.serialize(campaignAssessmentResult);
  },

  async anonymizeUser(request, h) {
    const userToAnonymizeId = request.params.id;
    const adminMemberId = request.auth.credentials.userId;
    const user = await usecases.anonymizeUser({ userId: userToAnonymizeId, updatedByUserId: adminMemberId });
    return h.response(userAnonymizedDetailsForAdminSerializer.serialize(user)).code(200);
  },

  async unblockUserAccount(request, h) {
    const userId = request.params.id;
    const userLogin = await usecases.unblockUserAccount({ userId });
    return h.response(userLoginSerializer.serialize(userLogin)).code(200);
  },

  async removeAuthenticationMethod(request, h) {
    const userId = request.params.id;
    const type = request.payload.data.attributes.type;
    await usecases.removeAuthenticationMethod({ userId, type });
    return h.response().code(204);
  },

  async sendVerificationCode(request, h) {
    const locale = requestResponseUtils.extractLocaleFromRequest(request);
    const i18n = request.i18n;
    const userId = request.params.id;
    const { newEmail, password } = await emailVerificationSerializer.deserialize(request.payload);

    await usecases.sendVerificationCode({ i18n, locale, newEmail, password, userId });
    return h.response().code(204);
  },

  async updateUserEmailWithValidation(request) {
    const userId = request.params.id;
    const code = request.payload.data.attributes.code;

    const updatedUserAttributes = await usecases.updateUserEmailWithValidation({
      userId,
      code,
    });

    return updateEmailSerializer.serialize(updatedUserAttributes);
  },

  async getUserAuthenticationMethods(request) {
    const userId = request.params.id;

    const authenticationMethods = await usecases.findUserAuthenticationMethods({ userId });

    return authenticationMethodsSerializer.serialize(authenticationMethods);
  },

  async addPixAuthenticationMethodByEmail(request, h) {
    const userId = request.params.id;
    const email = request.payload.data.attributes.email.trim().toLowerCase();

    const userUpdated = await usecases.addPixAuthenticationMethodByEmail({
      userId,
      email,
    });
    return h.response(userDetailsForAdminSerializer.serialize(userUpdated)).created();
  },

  async reassignAuthenticationMethods(request, h) {
    const authenticationMethodId = request.params.authenticationMethodId;
    const originUserId = request.params.userId;
    const targetUserId = request.payload.data.attributes['user-id'];

    await usecases.reassignAuthenticationMethodToAnotherUser({
      originUserId,
      targetUserId,
      authenticationMethodId,
    });
    return h.response().code(204);
  },

  async findCampaignParticipationsForUserManagement(request, h) {
    const userId = request.params.id;
    const campaignParticipations = await usecases.findCampaignParticipationsForUserManagement({
      userId,
    });
    return h.response(campaignParticipationForUserManagementSerializer.serialize(campaignParticipations));
  },

  async findUserOrganizationsForAdmin(request, h) {
    const userId = request.params.id;
    const organizations = await usecases.findUserOrganizationsForAdmin({
      userId,
    });
    return h.response(userOrganizationForAdminSerializer.serialize(organizations));
  },

  async findCertificationCenterMembershipsByUser(request, h) {
    const userId = request.params.id;
    const certificationCenterMemberships = await usecases.findCertificationCenterMembershipsByUser({
      userId,
    });
    return h.response(certificationCenterMembershipSerializer.serializeForAdmin(certificationCenterMemberships));
  },

  async rememberUserHasSeenLastDataProtectionPolicyInformation(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.rememberUserHasSeenLastDataProtectionPolicyInformation({
      userId: authenticatedUserId,
    });
    return userSerializer.serialize(updatedUser);
  },
};
