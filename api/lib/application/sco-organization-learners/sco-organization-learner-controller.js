import dayjs from 'dayjs';

import * as requestResponseUtils from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import * as scoOrganizationLearnerSerializer from '../../infrastructure/serializers/jsonapi/sco-organization-learner-serializer.js';
import * as studentInformationForAccountRecoverySerializer from '../../infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer.js';

const reconcileScoOrganizationLearnerManually = async function (
  request,
  h,
  dependencies = { scoOrganizationLearnerSerializer },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const payload = request.payload.data.attributes;
  const campaignCode = payload['campaign-code'];
  const withReconciliation = request.query.withReconciliation === 'true';

  const reconciliationInfo = {
    id: authenticatedUserId,
    firstName: payload['first-name'],
    lastName: payload['last-name'],
    birthdate: payload['birthdate'],
  };

  const organizationLearner = await usecases.reconcileScoOrganizationLearnerManually({
    campaignCode,
    reconciliationInfo,
    withReconciliation,
  });

  let response;
  if (withReconciliation) {
    const serializedData = dependencies.scoOrganizationLearnerSerializer.serializeIdentity(organizationLearner);
    response = h.response(serializedData).code(200);
  } else {
    response = h.response().code(204);
  }
  return response;
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

const generateUsername = async function (request, h, dependencies = { scoOrganizationLearnerSerializer }) {
  const payload = request.payload.data.attributes;
  const { 'campaign-code': campaignCode } = payload;

  const studentInformation = {
    firstName: payload['first-name'],
    lastName: payload['last-name'],
    birthdate: payload['birthdate'],
  };

  const username = await usecases.generateUsername({ campaignCode, studentInformation });

  const scoOrganizationLearner = {
    ...studentInformation,
    username,
    campaignCode,
  };

  return h
    .response(dependencies.scoOrganizationLearnerSerializer.serializeWithUsernameGeneration(scoOrganizationLearner))
    .code(200);
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
    campaignCode: payload['campaign-code'],
    locale,
    i18n: request.i18n,
  });

  return h.response().code(204);
};

const createUserAndReconcileToOrganizationLearnerFromExternalUser = async function (
  request,
  h,
  dependencies = { scoOrganizationLearnerSerializer },
) {
  const { birthdate, 'campaign-code': campaignCode, 'external-user-token': token } = request.payload.data.attributes;

  const accessToken = await usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser({
    birthdate,
    campaignCode,
    token,
  });

  const scoOrganizationLearner = {
    accessToken,
  };

  return h.response(dependencies.scoOrganizationLearnerSerializer.serializeExternal(scoOrganizationLearner)).code(200);
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

const generateUsernameWithTemporaryPassword = async function (
  request,
  h,
  dependencies = { scoOrganizationLearnerSerializer },
) {
  const payload = request.payload.data.attributes;
  const organizationId = payload['organization-id'];
  const organizationLearnerId = payload['organization-learner-id'];

  const result = await usecases.generateUsernameWithTemporaryPassword({
    organizationLearnerId,
    organizationId,
  });

  return h.response(dependencies.scoOrganizationLearnerSerializer.serializeCredentialsForDependent(result)).code(200);
};

const checkScoAccountRecovery = async function (
  request,
  h,
  dependencies = { studentInformationForAccountRecoverySerializer },
) {
  const studentInformation = await dependencies.studentInformationForAccountRecoverySerializer.deserialize(
    request.payload,
  );

  const studentInformationForAccountRecovery = await usecases.checkScoAccountRecovery({
    studentInformation,
  });

  return h.response(
    dependencies.studentInformationForAccountRecoverySerializer.serialize(studentInformationForAccountRecovery),
  );
};

const updateOrganizationLearnersPassword = async function (request, h) {
  const payload = request.payload.data.attributes;
  const userId = request.auth.credentials.userId;
  const organizationId = payload['organization-id'];
  const organizationLearnersId = payload['organization-learners-id'];

  const generatedCsvContent = await DomainTransaction.execute(async (domainTransaction) => {
    const organizationLearnersPasswordResets = await usecases.resetOrganizationLearnersPassword({
      userId,
      organizationId,
      organizationLearnersId,
      domainTransaction,
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

const scoOrganizationLearnerController = {
  reconcileScoOrganizationLearnerManually,
  reconcileScoOrganizationLearnerAutomatically,
  generateUsername,
  createAndReconcileUserToOrganizationLearner,
  createUserAndReconcileToOrganizationLearnerFromExternalUser,
  updatePassword,
  generateUsernameWithTemporaryPassword,
  checkScoAccountRecovery,
  updateOrganizationLearnersPassword,
};

export { scoOrganizationLearnerController };
