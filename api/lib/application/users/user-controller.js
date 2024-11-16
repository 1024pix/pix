import { usecases as devcompUsecases } from '../../../src/devcomp/domain/usecases/index.js';
import * as trainingSerializer from '../../../src/devcomp/infrastructure/serializers/jsonapi/training-serializer.js';
import { evaluationUsecases } from '../../../src/evaluation/domain/usecases/index.js';
import * as scorecardSerializer from '../../../src/evaluation/infrastructure/serializers/jsonapi/scorecard-serializer.js';
import * as userDetailsForAdminSerializer from '../../../src/identity-access-management/infrastructure/serializers/jsonapi/user-details-for-admin.serializer.js';
import * as campaignParticipationSerializer from '../../../src/prescription/campaign-participation/infrastructure/serializers/jsonapi/campaign-participation-serializer.js';
import * as certificationCenterMembershipSerializer from '../../../src/shared/infrastructure/serializers/jsonapi/certification-center-membership.serializer.js';
import * as userSerializer from '../../../src/shared/infrastructure/serializers/jsonapi/user-serializer.js';
import * as requestResponseUtils from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import * as userOrganizationForAdminSerializer from '../../infrastructure/serializers/jsonapi/user-organization-for-admin-serializer.js';

const rememberUserHasSeenAssessmentInstructions = async function (request, h, dependencies = { userSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const updatedUser = await usecases.rememberUserHasSeenAssessmentInstructions({ userId: authenticatedUserId });
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

const findPaginatedUserRecommendedTrainings = async function (
  request,
  h,
  dependencies = {
    trainingSerializer,
    requestResponseUtils,
    devcompUsecases,
  },
) {
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
  const { page } = request.query;
  const { userRecommendedTrainings, meta } = await dependencies.devcompUsecases.findPaginatedUserRecommendedTrainings({
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

const resetScorecard = function (request, h, dependencies = { scorecardSerializer, requestResponseUtils }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const competenceId = request.params.competenceId;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  return evaluationUsecases
    .resetScorecard({ userId: authenticatedUserId, competenceId, locale })
    .then(dependencies.scorecardSerializer.serialize);
};

const removeAuthenticationMethod = async function (request, h) {
  const userId = request.params.id;
  const authenticationMethodType = request.payload.data.attributes.type;
  await usecases.removeAuthenticationMethod({ userId, authenticationMethodType });
  return h.response().code(204);
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

const userController = {
  addPixAuthenticationMethodByEmail,
  findCertificationCenterMembershipsByUser,
  findPaginatedUserRecommendedTrainings,
  findUserOrganizationsForAdmin,
  getCampaignParticipations,
  reassignAuthenticationMethods,
  rememberUserHasSeenAssessmentInstructions,
  rememberUserHasSeenChallengeTooltip,
  removeAuthenticationMethod,
  resetScorecard,
};

export { userController };
