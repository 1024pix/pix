const campaignParticipationSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');
const campaignParticipationOverviewSerializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-overview-serializer');
const certificationCenterMembershipSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-membership-serializer');
const isCertifiableSerializer = require('../../infrastructure/serializers/jsonapi/is-certifiable-serializer');
const membershipSerializer = require('../../infrastructure/serializers/jsonapi/membership-serializer');
const scorecardSerializer = require('../../infrastructure/serializers/jsonapi/scorecard-serializer');
const profileSerializer = require('../../infrastructure/serializers/jsonapi/profile-serializer');
const sharedProfileForCampaignSerializer = require('../../infrastructure/serializers/jsonapi/shared-profile-for-campaign-serializer');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const userDetailsForAdminSerializer = require('../../infrastructure/serializers/jsonapi/user-details-for-admin-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');
const tokenService = require('../../domain/services/token-service');

const usecases = require('../../domain/usecases');

module.exports = {

  save(request, h) {
    const reCaptchaToken = request.payload.data.attributes['recaptcha-token'];
    const campaignCode = request.payload.meta ? request.payload.meta['campaign-code'] : null;
    const user = userSerializer.deserialize(request.payload);
    const locale = extractLocaleFromRequest(request);

    const password = request.payload.data.attributes.password;

    return usecases.createUser({
      user,
      password,
      campaignCode,
      reCaptchaToken,
      locale,
    })
      .then((savedUser) => {
        return h.response(userSerializer.serialize(savedUser)).created();
      });
  },

  getCurrentUser(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getCurrentUser({ authenticatedUserId })
      .then(userSerializer.serialize);
  },

  async getUserDetailsForAdmin(request) {
    const userId = parseInt(request.params.id);
    const userDetailsForAdmin = await usecases.getUserDetailsForAdmin({ userId });
    return userDetailsForAdminSerializer.serialize(userDetailsForAdmin);
  },

  async updateEmail(request, h) {
    const { email } = request.payload.data.attributes;
    const userId = parseInt(request.params.id);

    await usecases.updateUserEmail({
      email,
      userId,
    });

    return h.response({}).code(204);
  },

  async updatePassword(request) {
    const userId = parseInt(request.params.id);
    const password = request.payload.data.attributes.password;

    const updatedUser = await usecases.updateUserPassword({
      userId,
      password,
      temporaryKey: request.query['temporary-key'] || '',
    });

    return userSerializer.serialize(updatedUser);
  },

  async updateUserDetailsForAdministration(request) {
    const userId = parseInt(request.params.id);
    const userDetailsForAdministration = userDetailsForAdminSerializer.deserialize(request.payload);

    const updatedUser = await usecases.updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration,
    });

    return userDetailsForAdminSerializer.serialize(updatedUser);
  },

  async accepPixLastTermsOfService(request) {
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

  async acceptPixCertifTermsOfService(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.acceptPixCertifTermsOfService({
      userId: authenticatedUserId,
    });

    return userSerializer.serialize(updatedUser);
  },

  async rememberUserHasSeenAssessmentInstructions(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.rememberUserHasSeenAssessmentInstructions({ userId: authenticatedUserId });
    return userSerializer.serialize(updatedUser);
  },

  async rememberUserHasSeenNewLevelInfo(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.rememberUserHasSeenNewLevelInfo({ userId: authenticatedUserId });
    return userSerializer.serialize(updatedUser);
  },

  async rememberUserHasSeenNewDashboardInfo(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    const updatedUser = await usecases.rememberUserHasSeenNewDashboardInfo({ userId: authenticatedUserId });
    return userSerializer.serialize(updatedUser);
  },

  getMemberships(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getUserWithMemberships({ userId: authenticatedUserId })
      .then((user) => membershipSerializer.serialize(user.memberships));
  },

  getCertificationCenterMemberships(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getUserCertificationCenterMemberships({ userId: authenticatedUserId })
      .then((certificationCenterMemberships) => certificationCenterMembershipSerializer.serialize(certificationCenterMemberships));
  },

  async findPaginatedFilteredUsers(request) {
    const options = queryParamsUtils.extractParameters(request.query);

    const { models: users, pagination } = await usecases.findPaginatedFilteredUsers({
      filter: options.filter,
      page: options.page,
    });
    return userSerializer.serialize(users, pagination);
  },

  getCampaignParticipations(request) {
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.findLatestOngoingUserCampaignParticipations({ userId: authenticatedUserId })
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

    const isCertifiable = await usecases.isUserCertifiable({ userId: authenticatedUserId });
    return isCertifiableSerializer.serialize({ isCertifiable, userId: authenticatedUserId });
  },

  getProfile(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const locale = extractLocaleFromRequest(request);

    return usecases.getUserProfile({ userId: authenticatedUserId, locale })
      .then(profileSerializer.serialize);
  },

  resetScorecard(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const competenceId = request.params.competenceId;

    return usecases.resetScorecard({ userId: authenticatedUserId, competenceId })
      .then(scorecardSerializer.serialize);
  },

  getUserCampaignParticipationToCampaign(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const campaignId = request.params.campaignId;

    return usecases.getUserCampaignParticipationToCampaign({ userId: authenticatedUserId, campaignId })
      .then((campaignParticipation) => campaignParticipationSerializer.serialize(campaignParticipation));
  },

  async getUserProfileSharedForCampaign(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const campaignId = request.params.campaignId;

    const sharedProfileForCampaign = await usecases.getUserProfileSharedForCampaign({
      userId: authenticatedUserId,
      campaignId,
    });

    return sharedProfileForCampaignSerializer.serialize(sharedProfileForCampaign);
  },

  async anonymizeUser(request, h) {
    const userId = parseInt(request.params.id);
    await usecases.anonymizeUser({ userId });
    return h.response({}).code(204);
  },

  async dissociateSchoolingRegistrations(request) {
    const userId = parseInt(request.params.id);
    const userDetailsForAdmin = await usecases.dissociateSchoolingRegistrations({ userId });
    return userDetailsForAdminSerializer.serialize(userDetailsForAdmin);
  },

  async createPoleEmploiUser(request, h) {
    const authenticationKey = request.query['authentication-key'];

    const { userId, idToken } = await usecases.createUserFromPoleEmploi({ authenticationKey });

    const accessToken = tokenService.createAccessTokenFromUser(userId, 'pole_emploi_connect');

    const response = {
      access_token: accessToken,
      id_token: idToken,
    };
    return h.response(response).code(200);
  },

};
