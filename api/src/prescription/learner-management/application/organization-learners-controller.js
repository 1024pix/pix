import * as scoOrganizationLearnerSerializer from '../../../../lib/infrastructure/serializers/jsonapi/sco-organization-learner-serializer.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { ApplicationTransaction } from '../../shared/infrastructure/ApplicationTransaction.js';
import { usecases } from '../domain/usecases/index.js';

const deleteOrganizationLearners = async function (request, h) {
  const authenticatedUserId = request.auth.credentials.userId;
  const listLearners = request.payload.listLearners;

  await DomainTransaction.execute(async () => {
    await usecases.deleteOrganizationLearners({
      organizationLearnerIds: listLearners,
      userId: authenticatedUserId,
    });
  });
  return h.response().code(200);
};

const importOrganizationLearnerFromFeature = async function (request, h) {
  const organizationId = request.params.organizationId;
  const userId = request.auth.credentials.userId;

  await ApplicationTransaction.execute(async () => {
    await usecases.sendOrganizationLearnersFile({ payload: request.payload, organizationId, userId });
  });
  await ApplicationTransaction.execute(async () => {
    await usecases.validateOrganizationLearnersFile({ organizationId });
  });
  await ApplicationTransaction.execute(async () => {
    await usecases.saveOrganizationLearnersFile({ organizationId });
  });

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
  const campaignCode = payload['campaign-code'];
  const organizationLearner = await usecases.reconcileScoOrganizationLearnerAutomatically({
    userId: authenticatedUserId,
    campaignCode,
  });

  return h.response(dependencies.scoOrganizationLearnerSerializer.serializeIdentity(organizationLearner));
};

const organizationLearnersController = {
  reconcileCommonOrganizationLearner,
  deleteOrganizationLearners,
  importOrganizationLearnerFromFeature,
  dissociate,
  reconcileScoOrganizationLearnerAutomatically,
};

export { organizationLearnersController };
