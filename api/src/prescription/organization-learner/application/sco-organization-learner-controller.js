import {
  getForwardedOrigin,
  RequestedApplication,
} from '../../../identity-access-management/infrastructure/utils/network.js';
import * as scoOrganizationLearnerSerializer from '../../learner-management/infrastructure/serializers/jsonapi/sco-organization-learner-serializer.js';
import { usecases } from '../domain/usecases/index.js';

const createUserAndReconcileToOrganizationLearnerFromExternalUser = async function (
  request,
  h,
  dependencies = { scoOrganizationLearnerSerializer },
) {
  const { birthdate, 'campaign-code': campaignCode, 'external-user-token': token } = request.payload.data.attributes;

  const origin = getForwardedOrigin(request.headers);
  const requestedApplication = RequestedApplication.fromOrigin(origin);
  const accessToken = await usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser({
    birthdate,
    campaignCode,
    token,
    audience: origin,
    requestedApplication,
  });

  const scoOrganizationLearner = {
    accessToken,
  };

  return h.response(dependencies.scoOrganizationLearnerSerializer.serializeExternal(scoOrganizationLearner)).code(200);
};

const scoOrganizationLearnerController = {
  createUserAndReconcileToOrganizationLearnerFromExternalUser,
};

export { scoOrganizationLearnerController };
