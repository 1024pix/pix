import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { usecases } from '../domain/usecases/index.js';
import * as scoOrganizationLearnerSerializer from '../infrastructure/serializers/jsonapi/sco-organization-learner-serializer.js';

const deleteOrganizationLearners = async function (request, h) {
  const authenticatedUserId = request.auth.credentials.userId;
  const listLearners = request.payload.listLearners;
  const organizationId = request.params.organizationId;

  await DomainTransaction.execute(async () => {
    await usecases.deleteOrganizationLearners({
      organizationLearnerIds: listLearners,
      userId: authenticatedUserId,
      organizationId,
      userRole: 'ORGA_ADMIN',
      client: 'PIX_ORGA',
    });
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
  const { campaignCode, reconciliationInfos } = request.deserializedPayload;

  await usecases.reconcileCommonOrganizationLearner({
    campaignCode,
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

const organizationLearnersController = {
  reconcileCommonOrganizationLearner,
  deleteOrganizationLearners,
  importOrganizationLearnerFromFeature,
  dissociate,
  reconcileScoOrganizationLearnerAutomatically,
  updateOrganizationLearnerName,
};

export { organizationLearnersController };
