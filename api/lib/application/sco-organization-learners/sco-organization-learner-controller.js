import usecases from '../../domain/usecases';
import scoOrganizationLearnerSerializer from '../../infrastructure/serializers/jsonapi/sco-organization-learner-serializer';
import { extractLocaleFromRequest } from '../../infrastructure/utils/request-response-utils';
import studentInformationForAccountRecoverySerializer from '../../infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer';

export default {
  async reconcileScoOrganizationLearnerManually(request, h) {
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
      const serializedData = scoOrganizationLearnerSerializer.serializeIdentity(organizationLearner);
      response = h.response(serializedData).code(200);
    } else {
      response = h.response().code(204);
    }
    return response;
  },

  async reconcileScoOrganizationLearnerAutomatically(request, h) {
    const authenticatedUserId = request.auth.credentials.userId;
    const payload = request.payload.data.attributes;
    const campaignCode = payload['campaign-code'];
    const organizationLearner = await usecases.reconcileScoOrganizationLearnerAutomatically({
      userId: authenticatedUserId,
      campaignCode,
    });

    return h.response(scoOrganizationLearnerSerializer.serializeIdentity(organizationLearner));
  },

  async generateUsername(request, h) {
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
      .response(scoOrganizationLearnerSerializer.serializeWithUsernameGeneration(scoOrganizationLearner))
      .code(200);
  },

  async createAndReconcileUserToOrganizationLearner(request, h) {
    const payload = request.payload.data.attributes;
    const userAttributes = {
      firstName: payload['first-name'],
      lastName: payload['last-name'],
      birthdate: payload['birthdate'],
      email: payload.email,
      username: payload.username,
      withUsername: payload['with-username'],
    };
    const locale = extractLocaleFromRequest(request);

    await usecases.createAndReconcileUserToOrganizationLearner({
      userAttributes,
      password: payload.password,
      campaignCode: payload['campaign-code'],
      locale,
    });

    return h.response().code(204);
  },

  async createUserAndReconcileToOrganizationLearnerFromExternalUser(request, h) {
    const { birthdate, 'campaign-code': campaignCode, 'external-user-token': token } = request.payload.data.attributes;

    const accessToken = await usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser({
      birthdate,
      campaignCode,
      token,
    });

    const scoOrganizationLearner = {
      accessToken,
    };

    return h.response(scoOrganizationLearnerSerializer.serializeExternal(scoOrganizationLearner)).code(200);
  },

  async updatePassword(request, h) {
    const payload = request.payload.data.attributes;
    const userId = request.auth.credentials.userId;
    const organizationId = payload['organization-id'];
    const organizationLearnerId = payload['organization-learner-id'];

    const generatedPassword = await usecases.updateOrganizationLearnerDependentUserPassword({
      userId,
      organizationId,
      organizationLearnerId,
    });

    const scoOrganizationLearner = {
      generatedPassword,
    };

    return h
      .response(scoOrganizationLearnerSerializer.serializeCredentialsForDependent(scoOrganizationLearner))
      .code(200);
  },

  async generateUsernameWithTemporaryPassword(request, h) {
    const payload = request.payload.data.attributes;
    const organizationId = payload['organization-id'];
    const organizationLearnerId = payload['organization-learner-id'];

    const result = await usecases.generateUsernameWithTemporaryPassword({
      organizationLearnerId,
      organizationId,
    });

    return h.response(scoOrganizationLearnerSerializer.serializeCredentialsForDependent(result)).code(200);
  },

  async checkScoAccountRecovery(request, h) {
    const studentInformation = await studentInformationForAccountRecoverySerializer.deserialize(request.payload);

    const studentInformationForAccountRecovery = await usecases.checkScoAccountRecovery({
      studentInformation,
    });

    return h.response(studentInformationForAccountRecoverySerializer.serialize(studentInformationForAccountRecovery));
  },
};
