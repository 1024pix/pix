import * as campaignParticipationSerializer from '../../infrastructure/serializers/jsonapi/campaign-participation-serializer.js';
import * as campaignParticipationOverviewSerializer from '../../infrastructure/serializers/jsonapi/campaign-participation-overview-serializer.js';
import * as certificationEligibilitySerializer from '../../infrastructure/serializers/jsonapi/certification-eligibility-serializer.js';
import * as scorecardSerializer from '../../../src/evaluation/infrastructure/serializers/jsonapi/scorecard-serializer.js';
import * as profileSerializer from '../../infrastructure/serializers/jsonapi/profile-serializer.js';
import * as participantResultSerializer from '../../infrastructure/serializers/jsonapi/participant-result-serializer.js';
import * as sharedProfileForCampaignSerializer from '../../infrastructure/serializers/jsonapi/shared-profile-for-campaign-serializer.js';
import * as userSerializer from '../../infrastructure/serializers/jsonapi/user-serializer.js';
import * as userForAdminSerializer from '../../infrastructure/serializers/jsonapi/user-for-admin-serializer.js';
import * as userWithActivitySerializer from '../../infrastructure/serializers/jsonapi/user-with-activity-serializer.js';
import * as emailVerificationSerializer from '../../infrastructure/serializers/jsonapi/email-verification-serializer.js';
import * as userDetailsForAdminSerializer from '../../infrastructure/serializers/jsonapi/user-details-for-admin-serializer.js';
import * as userAnonymizedDetailsForAdminSerializer from '../../infrastructure/serializers/jsonapi/user-anonymized-details-for-admin-serializer.js';
import * as updateEmailSerializer from '../../infrastructure/serializers/jsonapi/update-email-serializer.js';
import * as authenticationMethodsSerializer from '../../infrastructure/serializers/jsonapi/authentication-methods-serializer.js';
import * as campaignParticipationForUserManagementSerializer from '../../infrastructure/serializers/jsonapi/campaign-participation-for-user-management-serializer.js';
import * as userOrganizationForAdminSerializer from '../../infrastructure/serializers/jsonapi/user-organization-for-admin-serializer.js';
import * as certificationCenterMembershipSerializer from '../../infrastructure/serializers/jsonapi/certification-center-membership-serializer.js';
import * as trainingSerializer from '../../infrastructure/serializers/jsonapi/training-serializer.js';
import * as userLoginSerializer from '../../infrastructure/serializers/jsonapi/user-login-serializer.js';

import * as queryParamsUtils from '../../infrastructure/utils/query-params-utils.js';
import * as requestResponseUtils from '../../infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import { evaluationUsecases } from '../../../src/evaluation/domain/usecases/index.js';
import * as localeService from '../../domain/services/locale-service.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import { eventBus } from '../../domain/events/index.js';

const save = async function (request, h, dependencies = { userSerializer, requestResponseUtils, localeService }) {
  const localeFromCookie = request.state?.locale;
  const canonicalLocaleFromCookie = localeFromCookie
    ? dependencies.localeService.getCanonicalLocale(localeFromCookie)
    : undefined;
  const campaignCode = request.payload.meta ? request.payload.meta['campaign-code'] : null;
  const user = { ...dependencies.userSerializer.deserialize(request.payload), locale: canonicalLocaleFromCookie };
  const localeFromHeader = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const password = request.payload.data.attributes.password;

  const savedUser = await usecases.createUser({
    user,
    password,
    campaignCode,
    localeFromHeader,
  });

  return h.response(dependencies.userSerializer.serialize(savedUser)).created();
};

const getCurrentUser = function (request, h, dependencies = { userWithActivitySerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;
  return usecases.getCurrentUser({ authenticatedUserId }).then(dependencies.userWithActivitySerializer.serialize);
};

const getUserDetailsForAdmin = async function (request, h, dependencies = { userDetailsForAdminSerializer }) {
  const userId = request.params.id;
  const userDetailsForAdmin = await usecases.getUserDetailsForAdmin({ userId });
  return dependencies.userDetailsForAdminSerializer.serialize(userDetailsForAdmin);
};

const updatePassword = async function (request, h, dependencies = { userSerializer }) {
  const userId = request.params.id;
  const password = request.payload.data.attributes.password;

  const updatedUser = await usecases.updateUserPassword({
    userId,
    password,
    temporaryKey: request.query['temporary-key'] || '',
  });

  return dependencies.userSerializer.serialize(updatedUser);
};

const updateUserDetailsForAdministration = async function (
  request,
  h,
  dependencies = { userDetailsForAdminSerializer },
) {
  const userId = request.params.id;
  const userDetailsForAdministration = dependencies.userDetailsForAdminSerializer.deserialize(request.payload);

  const updatedUser = await usecases.updateUserDetailsForAdministration({
    userId,
    userDetailsForAdministration,
  });

  return dependencies.userDetailsForAdminSerializer.serializeForUpdate(updatedUser);
};

const acceptPixLastTermsOfService = async function (request, h, dependencies = { userSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.acceptPixLastTermsOfService({
    userId: authenticatedUserId,
  });

  return dependencies.userSerializer.serialize(updatedUser);
};

const changeLang = async function (request, h, dependencies = { userSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const lang = request.params.lang;
  const updatedUser = await usecases.changeUserLang({
    userId: authenticatedUserId,
    lang,
  });

  return dependencies.userSerializer.serialize(updatedUser);
};

const acceptPixOrgaTermsOfService = async function (request, h, dependencies = { userSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.acceptPixOrgaTermsOfService({
    userId: authenticatedUserId,
  });

  return dependencies.userSerializer.serialize(updatedUser);
};

const acceptPixCertifTermsOfService = async function (request, h) {
  const authenticatedUserId = request.auth.credentials.userId;

  await usecases.acceptPixCertifTermsOfService({
    userId: authenticatedUserId,
  });

  return h.response().code(204);
};

const rememberUserHasSeenAssessmentInstructions = async function (request, h, dependencies = { userSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.rememberUserHasSeenAssessmentInstructions({ userId: authenticatedUserId });
  return dependencies.userSerializer.serialize(updatedUser);
};

const rememberUserHasSeenNewDashboardInfo = async function (request, h, dependencies = { userSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.rememberUserHasSeenNewDashboardInfo({ userId: authenticatedUserId });
  return dependencies.userSerializer.serialize(updatedUser);
};

const rememberUserHasSeenLevelSevenInfo = async function (request, h, dependencies = { userSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.rememberUserHasSeenLevelSevenInfo({ userId: authenticatedUserId });
  return dependencies.userSerializer.serialize(updatedUser);
};

const rememberUserHasSeenChallengeTooltip = async function (request, h, dependencies = { userSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const challengeType = request.params.challengeType;

  const updatedUser = await usecases.rememberUserHasSeenChallengeTooltip({
    userId: authenticatedUserId,
    challengeType,
  });
  return dependencies.userSerializer.serialize(updatedUser);
};

const findPaginatedFilteredUsers = async function (
  request,
  h,
  dependencies = { userForAdminSerializer, queryParamsUtils },
) {
  const options = dependencies.queryParamsUtils.extractParameters(request.query);

  const { models: users, pagination } = await usecases.findPaginatedFilteredUsers({
    filter: options.filter,
    page: options.page,
  });
  return dependencies.userForAdminSerializer.serialize(users, pagination);
};

const findPaginatedUserRecommendedTrainings = async function (
  request,
  h,
  dependencies = {
    trainingSerializer,
    requestResponseUtils,
    queryParamsUtils,
  },
) {
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
  const { page } = dependencies.queryParamsUtils.extractParameters(request.query);
  const { userRecommendedTrainings, meta } = await usecases.findPaginatedUserRecommendedTrainings({
    userId: request.auth.credentials.userId,
    locale,
    page,
  });

  return dependencies.trainingSerializer.serialize(userRecommendedTrainings, meta);
};

const getCampaignParticipations = function (request, h, dependencies = { campaignParticipationSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  return usecases
    .findLatestOngoingUserCampaignParticipations({ userId: authenticatedUserId })
    .then(dependencies.campaignParticipationSerializer.serialize);
};

const getCampaignParticipationOverviews = async function (
  request,
  h,
  dependencies = {
    campaignParticipationOverviewSerializer,
    queryParamsUtils,
  },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const query = dependencies.queryParamsUtils.extractParameters(request.query);

  const userCampaignParticipationOverviews = await usecases.findUserCampaignParticipationOverviews({
    userId: authenticatedUserId,
    states: query.filter.states,
    page: query.page,
  });

  return dependencies.campaignParticipationOverviewSerializer.serializeForPaginatedList(
    userCampaignParticipationOverviews,
  );
};

const isCertifiable = async function (request, h, dependencies = { certificationEligibilitySerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const certificationEligibility = await usecases.getUserCertificationEligibility({ userId: authenticatedUserId });
  return dependencies.certificationEligibilitySerializer.serialize(certificationEligibility);
};

const getProfile = function (request, h, dependencies = { profileSerializer, requestResponseUtils }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  return usecases
    .getUserProfile({ userId: authenticatedUserId, locale })
    .then(dependencies.profileSerializer.serialize);
};

const getProfileForAdmin = function (request, h, dependencies = { profileSerializer, requestResponseUtils }) {
  const userId = request.params.id;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  return usecases.getUserProfile({ userId, locale }).then(dependencies.profileSerializer.serialize);
};

const resetScorecard = function (request, h, dependencies = { scorecardSerializer, requestResponseUtils }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const competenceId = request.params.competenceId;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  return evaluationUsecases
    .resetScorecard({ userId: authenticatedUserId, competenceId, locale })
    .then(dependencies.scorecardSerializer.serialize);
};

const getUserCampaignParticipationToCampaign = function (
  request,
  h,
  dependencies = { campaignParticipationSerializer },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const campaignId = request.params.campaignId;

  return usecases
    .getUserCampaignParticipationToCampaign({ userId: authenticatedUserId, campaignId })
    .then((campaignParticipation) => dependencies.campaignParticipationSerializer.serialize(campaignParticipation));
};

const getUserProfileSharedForCampaign = async function (
  request,
  h,
  dependencies = {
    sharedProfileForCampaignSerializer,
    requestResponseUtils,
  },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const campaignId = request.params.campaignId;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const sharedProfileForCampaign = await usecases.getUserProfileSharedForCampaign({
    userId: authenticatedUserId,
    campaignId,
    locale,
  });

  return dependencies.sharedProfileForCampaignSerializer.serialize(sharedProfileForCampaign);
};

const getUserCampaignAssessmentResult = async function (
  request,
  h,
  dependencies = {
    participantResultSerializer,
    requestResponseUtils,
  },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const campaignId = request.params.campaignId;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const campaignAssessmentResult = await usecases.getUserCampaignAssessmentResult({
    userId: authenticatedUserId,
    campaignId,
    locale,
  });

  return dependencies.participantResultSerializer.serialize(campaignAssessmentResult);
};

const anonymizeUser = async function (request, h, dependencies = { userAnonymizedDetailsForAdminSerializer }) {
  const userToAnonymizeId = request.params.id;
  const adminMemberId = request.auth.credentials.userId;

  await DomainTransaction.execute(async (domainTransaction) => {
    const event = await usecases.anonymizeUser({
      userId: userToAnonymizeId,
      updatedByUserId: adminMemberId,
      domainTransaction,
    });
    await eventBus.publish(event, domainTransaction);
  });

  const anonymizedUser = await usecases.getUserDetailsForAdmin({ userId: userToAnonymizeId });

  return h.response(dependencies.userAnonymizedDetailsForAdminSerializer.serialize(anonymizedUser)).code(200);
};

const unblockUserAccount = async function (request, h, dependencies = { userLoginSerializer }) {
  const userId = request.params.id;
  const userLogin = await usecases.unblockUserAccount({ userId });
  return h.response(dependencies.userLoginSerializer.serialize(userLogin)).code(200);
};

const removeAuthenticationMethod = async function (request, h) {
  const userId = request.params.id;
  const type = request.payload.data.attributes.type;
  await usecases.removeAuthenticationMethod({ userId, type });
  return h.response().code(204);
};

const sendVerificationCode = async function (
  request,
  h,
  dependencies = { emailVerificationSerializer, requestResponseUtils },
) {
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
  const i18n = request.i18n;
  const userId = request.params.id;
  const { newEmail, password } = await dependencies.emailVerificationSerializer.deserialize(request.payload);

  await usecases.sendVerificationCode({ i18n, locale, newEmail, password, userId });
  return h.response().code(204);
};

const updateUserEmailWithValidation = async function (request, h, dependencies = { updateEmailSerializer }) {
  const userId = request.params.id;
  const code = request.payload.data.attributes.code;

  const updatedUserAttributes = await usecases.updateUserEmailWithValidation({
    userId,
    code,
  });

  return dependencies.updateEmailSerializer.serialize(updatedUserAttributes);
};

const getUserAuthenticationMethods = async function (request, h, dependencies = { authenticationMethodsSerializer }) {
  const userId = request.params.id;

  const authenticationMethods = await usecases.findUserAuthenticationMethods({ userId });

  return dependencies.authenticationMethodsSerializer.serialize(authenticationMethods);
};

const addPixAuthenticationMethodByEmail = async function (
  request,
  h,
  dependencies = { userDetailsForAdminSerializer },
) {
  const userId = request.params.id;
  const email = request.payload.data.attributes.email.trim().toLowerCase();

  const userUpdated = await usecases.addPixAuthenticationMethodByEmail({
    userId,
    email,
  });
  return h.response(dependencies.userDetailsForAdminSerializer.serialize(userUpdated)).created();
};

const reassignAuthenticationMethods = async function (request, h) {
  const authenticationMethodId = request.params.authenticationMethodId;
  const originUserId = request.params.userId;
  const targetUserId = request.payload.data.attributes['user-id'];

  await usecases.reassignAuthenticationMethodToAnotherUser({
    originUserId,
    targetUserId,
    authenticationMethodId,
  });
  return h.response().code(204);
};

const findCampaignParticipationsForUserManagement = async function (
  request,
  h,
  dependencies = { campaignParticipationForUserManagementSerializer },
) {
  const userId = request.params.id;
  const campaignParticipations = await usecases.findCampaignParticipationsForUserManagement({
    userId,
  });
  return h.response(dependencies.campaignParticipationForUserManagementSerializer.serialize(campaignParticipations));
};

const findUserOrganizationsForAdmin = async function (
  request,
  h,
  dependencies = { userOrganizationForAdminSerializer },
) {
  const userId = request.params.id;
  const organizations = await usecases.findUserOrganizationsForAdmin({
    userId,
  });
  return h.response(dependencies.userOrganizationForAdminSerializer.serialize(organizations));
};

const findCertificationCenterMembershipsByUser = async function (
  request,
  h,
  dependencies = { certificationCenterMembershipSerializer },
) {
  const userId = request.params.id;
  const certificationCenterMemberships = await usecases.findCertificationCenterMembershipsByUser({
    userId,
  });
  return h.response(
    dependencies.certificationCenterMembershipSerializer.serializeForAdmin(certificationCenterMemberships),
  );
};

const rememberUserHasSeenLastDataProtectionPolicyInformation = async function (
  request,
  h,
  dependencies = { userSerializer },
) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.rememberUserHasSeenLastDataProtectionPolicyInformation({
    userId: authenticatedUserId,
  });
  return dependencies.userSerializer.serialize(updatedUser);
};

const userController = {
  save,
  getCurrentUser,
  getUserDetailsForAdmin,
  updatePassword,
  updateUserDetailsForAdministration,
  acceptPixLastTermsOfService,
  changeLang,
  acceptPixOrgaTermsOfService,
  acceptPixCertifTermsOfService,
  rememberUserHasSeenAssessmentInstructions,
  rememberUserHasSeenNewDashboardInfo,
  rememberUserHasSeenLevelSevenInfo,
  rememberUserHasSeenChallengeTooltip,
  findPaginatedFilteredUsers,
  findPaginatedUserRecommendedTrainings,
  getCampaignParticipations,
  getCampaignParticipationOverviews,
  isCertifiable,
  getProfile,
  getProfileForAdmin,
  resetScorecard,
  getUserCampaignParticipationToCampaign,
  getUserProfileSharedForCampaign,
  getUserCampaignAssessmentResult,
  anonymizeUser,
  unblockUserAccount,
  removeAuthenticationMethod,
  sendVerificationCode,
  updateUserEmailWithValidation,
  getUserAuthenticationMethods,
  addPixAuthenticationMethodByEmail,
  reassignAuthenticationMethods,
  findCampaignParticipationsForUserManagement,
  findUserOrganizationsForAdmin,
  findCertificationCenterMembershipsByUser,
  rememberUserHasSeenLastDataProtectionPolicyInformation,
};

export { userController };
