import dayjs from 'dayjs';

import {
  getForwardedOrigin,
  RequestedApplication,
} from '../../../identity-access-management/infrastructure/utils/network.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { requestResponseUtils } from '../../../shared/infrastructure/utils/request-response-utils.js';
import * as scoOrganizationLearnerSerializer from '../../learner-management/infrastructure/serializers/jsonapi/sco-organization-learner-serializer.js';
import { usecases } from '../domain/usecases/index.js';

const createUserAndReconcileToOrganizationLearnerFromExternalUser = async function (
  request,
  h,
  dependencies = { scoOrganizationLearnerSerializer },
) {
  const {
    birthdate,
    'organization-id': organizationId,
    'external-user-token': token,
  } = request.payload.data.attributes;

  const origin = getForwardedOrigin(request.headers);
  const requestedApplication = RequestedApplication.fromOrigin(origin);
  const accessToken = await usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser({
    birthdate,
    organizationId,
    token,
    audience: origin,
    requestedApplication,
  });

  const scoOrganizationLearner = {
    accessToken,
  };

  return h.response(dependencies.scoOrganizationLearnerSerializer.serializeExternal(scoOrganizationLearner)).code(200);
};

const createAndReconcileUserToOrganizationLearner = async function (
  request,
  h,
  dependencies = {
    scoOrganizationLearnerSerializer,
    requestResponseUtils,
  },
) {
  const payload = request.payload.data.attributes;
  const userAttributes = {
    firstName: payload['first-name'],
    lastName: payload['last-name'],
    birthdate: payload['birthdate'],
    email: payload.email,
    username: payload.username,
    withUsername: payload['with-username'],
  };
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  await usecases.createAndReconcileUserToOrganizationLearner({
    userAttributes,
    password: payload.password,
    organizationId: payload['organization-id'],
    redirectionUrl: payload['redirection-url'],
    locale,
    i18n: request.i18n,
  });

  return h.response().code(204);
};

const batchGenerateOrganizationLearnersUsernameWithTemporaryPassword = async function (request, h) {
  const payload = request.payload.data.attributes;
  const userId = request.auth.credentials.userId;
  const organizationId = payload['organization-id'];
  const organizationLearnersId = payload['organization-learners-id'];

  const generatedCsvContent = await DomainTransaction.execute(async () => {
    const organizationLearnersPasswordResets = await usecases.generateOrganizationLearnersUsernameAndTemporaryPassword({
      userId,
      organizationId,
      organizationLearnersId,
    });
    return usecases.generateResetOrganizationLearnersPasswordCsvContent({
      organizationLearnersPasswordResets,
    });
  });

  const dateWithTime = dayjs().locale('fr').format('YYYYMMDD_HHmm');
  const generatedCsvContentFileName = `${dateWithTime}_organization_learners_password_reset.csv`;

  return h
    .response(generatedCsvContent)
    .header('Content-Type', 'text/csv;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${generatedCsvContentFileName}`);
};

const updatePassword = async function (request, h, dependencies = { scoOrganizationLearnerSerializer }) {
  const payload = request.payload.data.attributes;
  const userId = request.auth.credentials.userId;
  const organizationId = payload['organization-id'];
  const organizationLearnerId = payload['organization-learner-id'];

  const scoOrganizationLearner = await usecases.updateOrganizationLearnerDependentUserPassword({
    userId,
    organizationId,
    organizationLearnerId,
  });

  return h
    .response(dependencies.scoOrganizationLearnerSerializer.serializeCredentialsForDependent(scoOrganizationLearner))
    .code(200);
};

const scoOrganizationLearnerController = {
  createUserAndReconcileToOrganizationLearnerFromExternalUser,
  createAndReconcileUserToOrganizationLearner,
  updatePassword,
  batchGenerateOrganizationLearnersUsernameWithTemporaryPassword,
};

export { scoOrganizationLearnerController };
