const campaignParticipationSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer.js');
const campaignParticipationOverviewSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-overview-serializer.js');
const certificationEligibilitySerializer = require('../../infrastructure/serializers/jsonapi/certification-eligibility-serializer.js');
const scorecardSerializer = require('../../infrastructure/serializers/jsonapi/scorecard-serializer.js');
const profileSerializer = require('../../infrastructure/serializers/jsonapi/profile-serializer.js');
const participantResultSerializer = require('../../infrastructure/serializers/jsonapi/participant-result-serializer.js');
const sharedProfileForCampaignSerializer = require('../../infrastructure/serializers/jsonapi/shared-profile-for-campaign-serializer.js');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer.js');
const userForAdminSerializer = require('../../infrastructure/serializers/jsonapi/user-for-admin-serializer.js');
const userWithActivitySerializer = require('../../infrastructure/serializers/jsonapi/user-with-activity-serializer.js');
const emailVerificationSerializer = require('../../infrastructure/serializers/jsonapi/email-verification-serializer.js');
const userDetailsForAdminSerializer = require('../../infrastructure/serializers/jsonapi/user-details-for-admin-serializer.js');
const userAnonymizedDetailsForAdminSerializer = require('../../infrastructure/serializers/jsonapi/user-anonymized-details-for-admin-serializer.js');
const updateEmailSerializer = require('../../infrastructure/serializers/jsonapi/update-email-serializer.js');
const authenticationMethodsSerializer = require('../../infrastructure/serializers/jsonapi/authentication-methods-serializer.js');
const campaignParticipationForUserManagementSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-for-user-management-serializer.js');
const userOrganizationForAdminSerializer = require('../../infrastructure/serializers/jsonapi/user-organization-for-admin-serializer.js');
const certificationCenterMembershipSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-membership-serializer.js');
const trainingSerializer = require('../../infrastructure/serializers/jsonapi/training-serializer.js');
const userLoginSerializer = require('../../infrastructure/serializers/jsonapi/user-login-serializer.js');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils.js');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils.js');

const usecases = require('../../domain/usecases/index.js');
const localeService = require('../../domain/services/locale-service.js');

module.exports = {
  async save(request, h, dependencies = { userSerializer }) {
    const localeFromCookie = request.state?.locale;
    const canonicalLocaleFromCookie = localeFromCookie ? localeService.getCanonicalLocale(localeFromCookie) : undefined;
    const campaignCode = request.payload.meta ? request.payload.meta['campaign-code'] : null;
    const user = { ...userSerializer.deserialize(request.payload), locale: canonicalLocaleFromCookie };
    const localeFromHeader = requestResponseUtils.extractLocaleFromRequest(request);

    const password = request.payload.data.attributes.password;

    const savedUser = await usecases.createUser({
      user,
      password,
      campaignCode,
      localeFromHeader,
    });

    return h.response(dependencies.userSerializer.serialize(savedUser)).created();
  },

  getCurrentUser(request, h, dependencies = { userWithActivitySerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;
    return usecases.getCurrentUser({ authenticatedUserId }).then(dependencies.userWithActivitySerializer.serialize);
  },

  async getUserDetailsForAdmin(request, h, dependencies = { userDetailsForAdminSerializer }) {
    const userId = request.params.id;
    const userDetailsForAdmin = await usecases.getUserDetailsForAdmin({ userId });
    return dependencies.userDetailsForAdminSerializer.serialize(userDetailsForAdmin);
  },

  async updatePassword(request, h, dependencies = { userSerializer }) {
    const userId = request.params.id;
    const password = request.payload.data.attributes.password;

    const updatedUser = await usecases.updateUserPassword({
      userId,
      password,
      temporaryKey: request.query['temporary-key'] || '',
    });

    return dependencies.userSerializer.serialize(updatedUser);
  },

  async updateUserDetailsForAdministration(
  request,
  h,
  dependencies = { userDetailsForAdminSerializer }
) {
    const userId = request.params.id;
    const userDetailsForAdministration = userDetailsForAdminSerializer.deserialize(request.payload);

    const updatedUser = await usecases.updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration,
    });

    return dependencies.userDetailsForAdminSerializer.serializeForUpdate(updatedUser);
  },

  async acceptPixLastTermsOfService(request, h, dependencies = { userSerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.acceptPixLastTermsOfService({
      userId: authenticatedUserId,
    });

    return dependencies.userSerializer.serialize(updatedUser);
  },

  async changeLang(request, h, dependencies = { userSerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;
    const lang = request.params.lang;
    const updatedUser = await usecases.changeUserLang({
      userId: authenticatedUserId,
      lang,
    });

    return dependencies.userSerializer.serialize(updatedUser);
  },

  async acceptPixOrgaTermsOfService(request, h, dependencies = { userSerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.acceptPixOrgaTermsOfService({
      userId: authenticatedUserId,
    });

    return dependencies.userSerializer.serialize(updatedUser);
  },

  async acceptPixCertifTermsOfService(request, h) {
    const authenticatedUserId = request.auth.credentials.userId;

    await usecases.acceptPixCertifTermsOfService({
      userId: authenticatedUserId,
    });

    return h.response().code(204);
  },

  async rememberUserHasSeenAssessmentInstructions(request, h, dependencies = { userSerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.rememberUserHasSeenAssessmentInstructions({ userId: authenticatedUserId });
    return dependencies.userSerializer.serialize(updatedUser);
  },

  async rememberUserHasSeenNewDashboardInfo(request, h, dependencies = { userSerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.rememberUserHasSeenNewDashboardInfo({ userId: authenticatedUserId });
    return dependencies.userSerializer.serialize(updatedUser);
  },

  async rememberUserHasSeenChallengeTooltip(request, h, dependencies = { userSerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;
    const challengeType = request.params.challengeType;

    const updatedUser = await usecases.rememberUserHasSeenChallengeTooltip({
      userId: authenticatedUserId,
      challengeType,
    });
    return dependencies.userSerializer.serialize(updatedUser);
  },

  async findPaginatedFilteredUsers(request, h, dependencies = { userForAdminSerializer }) {
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: users, pagination } = await usecases.findPaginatedFilteredUsers({
      filter: options.filter,
      page: options.page,
    });
    return dependencies.userForAdminSerializer.serialize(users, pagination);
  },

  async findPaginatedUserRecommendedTrainings(request, h, dependencies = { trainingSerializer }) {
    const locale = requestResponseUtils.extractLocaleFromRequest(request);
    const { page } = queryParamsUtils.extractParameters(request.query);
    const { userRecommendedTrainings, meta } = await usecases.findPaginatedUserRecommendedTrainings({
      userId: request.auth.credentials.userId,
      locale,
      page,
    });

    return dependencies.trainingSerializer.serialize(userRecommendedTrainings, meta);
  },

  getCampaignParticipations(request, h, dependencies = { campaignParticipationSerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases
      .findLatestOngoingUserCampaignParticipations({ userId: authenticatedUserId })
      .then(dependencies.campaignParticipationSerializer.serialize);
  },

  async getCampaignParticipationOverviews(
  request,
  h,
  dependencies = { campaignParticipationOverviewSerializer }
) {
    const authenticatedUserId = request.auth.credentials.userId;
    const query = queryParamsUtils.extractParameters(request.query);

    const userCampaignParticipationOverviews = await usecases.findUserCampaignParticipationOverviews({
      userId: authenticatedUserId,
      states: query.filter.states,
      page: query.page,
    });

    return dependencies.campaignParticipationOverviewSerializer.serializeForPaginatedList(
    userCampaignParticipationOverviews
  );
},

  async isCertifiable(request, h, dependencies = { certificationEligibilitySerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;

    const certificationEligibility = await usecases.getUserCertificationEligibility({ userId: authenticatedUserId });
    return dependencies.certificationEligibilitySerializer.serialize(certificationEligibility);
  },

  getProfile(request, h, dependencies = { profileSerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;
    const locale = requestResponseUtils.extractLocaleFromRequest(request);

    return usecases
    .getUserProfile({ userId: authenticatedUserId, locale })
    .then(dependencies.profileSerializer.serialize);
  },

  getProfileForAdmin(request, h, dependencies = { profileSerializer }) {
    const userId = request.params.id;
    const locale = requestResponseUtils.extractLocaleFromRequest(request);

    return usecases.getUserProfile({ userId, locale }).then(dependencies.profileSerializer.serialize);
  },

  resetScorecard(request, h, dependencies = { scorecardSerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;
    const competenceId = request.params.competenceId;
    const locale = requestResponseUtils.extractLocaleFromRequest(request);

    return usecases
      .resetScorecard({ userId: authenticatedUserId, competenceId, locale })
      .then(dependencies.scorecardSerializer.serialize);
  },

  getUserCampaignParticipationToCampaign(
  request,
  h,
  dependencies = { campaignParticipationSerializer }
) {
    const authenticatedUserId = request.auth.credentials.userId;
    const campaignId = request.params.campaignId;

    return usecases
      .getUserCampaignParticipationToCampaign({ userId: authenticatedUserId, campaignId })
      .then((campaignParticipation) => dependencies.campaignParticipationSerializer.serialize(campaignParticipation));
  },

  async getUserProfileSharedForCampaign(
  request,
  h,
  dependencies = { sharedProfileForCampaignSerializer }
) {
    const authenticatedUserId = request.auth.credentials.userId;
    const campaignId = request.params.campaignId;
    const locale = requestResponseUtils.extractLocaleFromRequest(request);

    const sharedProfileForCampaign = await usecases.getUserProfileSharedForCampaign({
      userId: authenticatedUserId,
      campaignId,
      locale,
    });

    return dependencies.sharedProfileForCampaignSerializer.serialize(sharedProfileForCampaign);
  },

  async getUserCampaignAssessmentResult(request, h, dependencies = { participantResultSerializer }) {
    const authenticatedUserId = request.auth.credentials.userId;
    const campaignId = request.params.campaignId;
    const locale = requestResponseUtils.extractLocaleFromRequest(request);

    const campaignAssessmentResult = await usecases.getUserCampaignAssessmentResult({
      userId: authenticatedUserId,
      campaignId,
      locale,
    });

    return dependencies.participantResultSerializer.serialize(campaignAssessmentResult);
  },

  async anonymizeUser(request, h, dependencies = { userAnonymizedDetailsForAdminSerializer }) {
    const userToAnonymizeId = request.params.id;
    const adminMemberId = request.auth.credentials.userId;
    const user = await usecases.anonymizeUser({ userId: userToAnonymizeId, updatedByUserId: adminMemberId });
    return h.response(dependencies.userAnonymizedDetailsForAdminSerializer.serialize(user)).code(200);
  },

  async unblockUserAccount(request, h, dependencies = { userLoginSerializer }) {
    const userId = request.params.id;
    const userLogin = await usecases.unblockUserAccount({ userId });
    return h.response(dependencies.userLoginSerializer.serialize(userLogin)).code(200);
  },

  async removeAuthenticationMethod(request, h) {
    const userId = request.params.id;
    const type = request.payload.data.attributes.type;
    await usecases.removeAuthenticationMethod({ userId, type });
    return h.response().code(204);
  },

  async sendVerificationCode(request, h, dependencies = { emailVerificationSerializer }) {
    const locale = requestResponseUtils.extractLocaleFromRequest(request);
    const i18n = request.i18n;
    const userId = request.params.id;
    const { newEmail, password } = await dependencies.emailVerificationSerializer.deserialize(request.payload);

    await usecases.sendVerificationCode({ i18n, locale, newEmail, password, userId });
    return h.response().code(204);
  },

  async updateUserEmailWithValidation(request, h, dependencies = { updateEmailSerializer }) {
    const userId = request.params.id;
    const code = request.payload.data.attributes.code;

    const updatedUserAttributes = await usecases.updateUserEmailWithValidation({
      userId,
      code,
    });

    return dependencies.updateEmailSerializer.serialize(updatedUserAttributes);
  },

  async getUserAuthenticationMethods(request, h, dependencies = { authenticationMethodsSerializer }) {
    const userId = request.params.id;

    const authenticationMethods = await usecases.findUserAuthenticationMethods({ userId });

    return dependencies.authenticationMethodsSerializer.serialize(authenticationMethods);
  },

  async addPixAuthenticationMethodByEmail(
  request,
  h,
  dependencies = { userDetailsForAdminSerializer }
) {
    const userId = request.params.id;
    const email = request.payload.data.attributes.email.trim().toLowerCase();

    const userUpdated = await usecases.addPixAuthenticationMethodByEmail({
      userId,
      email,
    });
    return h.response(dependencies.userDetailsForAdminSerializer.serialize(userUpdated)).created();
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

  async findCampaignParticipationsForUserManagement(request, h,
    dependencies = { campaignParticipationForUserManagementSerializer }
) {const userId = request.params.id;
    const campaignParticipations = await usecases.findCampaignParticipationsForUserManagement({
      userId,
    });
    return h.response(dependencies.campaignParticipationForUserManagementSerializer.serialize(campaignParticipations));
  },

  async findUserOrganizationsForAdmin(request, h,
    dependencies = { userOrganizationForAdminSerializer }
) {const userId = request.params.id;
    const organizations = await usecases.findUserOrganizationsForAdmin({
      userId,
    });
    return h.response(dependencies.userOrganizationForAdminSerializer.serialize(organizations));
  },

  async findCertificationCenterMembershipsByUser(request, h,
    dependencies = { certificationCenterMembershipSerializer }
) {const userId = request.params.id;
    const certificationCenterMemberships = await usecases.findCertificationCenterMembershipsByUser({
      userId,
    });
    return h.response(dependencies.certificationCenterMembershipSerializer.serializeForAdmin(certificationCenterMemberships)
  );
},

  async rememberUserHasSeenLastDataProtectionPolicyInformation(
  request,
  h,
  dependencies = { userSerializer }
) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.rememberUserHasSeenLastDataProtectionPolicyInformation({
      userId: authenticatedUserId,
    });
    return dependencies.userSerializer.serialize(updatedUser);
  },
};
