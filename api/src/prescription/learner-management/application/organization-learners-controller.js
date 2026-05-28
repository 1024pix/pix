import { CLIENTS, PIX_ADMIN, PIX_ORGA } from '../../../shared/domain/constants.js';
import { usecases } from '../domain/usecases/index.js';
import * as organizationLearnerFilterSerializer from '../infrastructure/serializers/jsonapi/organization-learner-filter-serializer.js';
import * as scoOrganizationLearnerSerializer from '../infrastructure/serializers/jsonapi/sco-organization-learner-serializer.js';

const deleteOrganizationLearners = async function (request, h) {
  const authenticatedUserId = request.auth.credentials.userId;
  const listLearners = request.payload.listLearners;
  const organizationId = request.params.organizationId;

  await usecases.deleteOrganizationLearners({
    organizationLearnerIds: listLearners,
    userId: authenticatedUserId,
    organizationId,
    userRole: PIX_ORGA.ROLES.ADMIN,
    client: CLIENTS.ORGA,
  });
  return h.response().code(200);
};

const deleteOrganizationLearnerFromAdmin = async function (request, h) {
  const authenticatedUserId = request.auth.credentials.userId;
  const organizationLearnerId = request.params.organizationLearnerId;
  const organizationId = request.params.organizationId;

  await usecases.deleteOrganizationLearners({
    organizationLearnerIds: [organizationLearnerId],
    userId: authenticatedUserId,
    organizationId,
    userRole: PIX_ADMIN.ROLES.SUPPORT,
    client: CLIENTS.ADMIN,
  });

  return h.response().code(200);
};

const importOrganizationLearnerFromFeature = async function (request, h) {
  const organizationId = request.params.organizationId;
  const userId = request.auth.credentials.userId;

  await usecases.sendOrganizationLearnersFile({ payload: request.payload, organizationId, userId });

  return h.response().code(204);
};

const reconcileCommonOrganizationLearner = async function (request, h) {
  const authenticatedUserId = request.auth.credentials.userId;
  const { organizationId, reconciliationInfos } = request.deserializedPayload;

  await usecases.reconcileCommonOrganizationLearner({
    organizationId,
    userId: authenticatedUserId,
    reconciliationInfos,
  });

  return h.response().code(204);
};

const dissociate = async function (request, h) {
  const organizationLearnerId = request.params.id;
  await usecases.dissociateUserFromOrganizationLearner({ organizationLearnerId });
  return h.response().code(204);
};

const reconcileScoOrganizationLearnerAutomatically = async function (
  request,
  h,
  dependencies = { scoOrganizationLearnerSerializer },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const payload = request.payload.data.attributes;
  const organizationId = payload['organization-id'];
  const organizationLearner = await usecases.reconcileScoOrganizationLearnerAutomatically({
    userId: authenticatedUserId,
    organizationId,
  });

  return h.response(dependencies.scoOrganizationLearnerSerializer.serializeIdentity(organizationLearner));
};

const updateOrganizationLearnerName = async function (request, h) {
  const organizationLearnerId = request.params.organizationLearnerId;
  const { firstName, lastName } = request.payload;

  await usecases.updateOrganizationLearnerName({
    organizationLearnerId,
    firstName,
    lastName,
  });

  return h.response().code(204);
};

const getOrganizationLearnerFilters = async function (
  request,
  _,
  dependencies = { organizationLearnerFilterSerializer },
) {
  const organizationId = request.params.organizationId;
  const filters = await usecases.getOrganizationLearnerFilters({ organizationId });
  return dependencies.organizationLearnerFilterSerializer.serialize(filters);
};

const organizationLearnersController = {
  reconcileCommonOrganizationLearner,
  deleteOrganizationLearners,
  deleteOrganizationLearnerFromAdmin,
  getOrganizationLearnerFilters,
  importOrganizationLearnerFromFeature,
  dissociate,
  reconcileScoOrganizationLearnerAutomatically,
  updateOrganizationLearnerName,
};

export { organizationLearnersController };
