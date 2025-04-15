import dayjs from 'dayjs';

import * as studentInformationForAccountRecoverySerializer from '../../../src/identity-access-management/infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer.js';
import * as scoOrganizationLearnerSerializer from '../../../src/prescription/learner-management/infrastructure/serializers/jsonapi/sco-organization-learner-serializer.js';
import { DomainTransaction } from '../../../src/shared/domain/DomainTransaction.js';
import * as requestResponseUtils from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';

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

const scoOrganizationLearnerController = {
  generateUsername,
  createAndReconcileUserToOrganizationLearner,
  updatePassword,
  generateUsernameWithTemporaryPassword,
  checkScoAccountRecovery,
  batchGenerateOrganizationLearnersUsernameWithTemporaryPassword,
};

export { scoOrganizationLearnerController };
