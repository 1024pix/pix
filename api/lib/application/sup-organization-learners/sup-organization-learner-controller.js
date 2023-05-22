import { usecases } from '../../domain/usecases/index.js';

const reconcileSupOrganizationLearner = async function (request, h) {
  const userId = request.auth.credentials.userId;
  const payload = request.payload.data.attributes;

  const campaignCode = payload['campaign-code'];

  const reconciliationInfo = {
    userId,
    studentNumber: payload['student-number'],
    firstName: payload['first-name'],
    lastName: payload['last-name'],
    birthdate: payload['birthdate'],
  };

  await usecases.reconcileSupOrganizationLearner({ campaignCode, reconciliationInfo });

  return h.response(null).code(204);
};

const updateStudentNumber = async function (request, h) {
  const payload = request.payload.data.attributes;
  const organizationId = request.params.id;
  const studentNumber = payload['student-number'];
  const organizationLearnerId = request.params.organizationLearnerId;

  await usecases.updateStudentNumber({ organizationLearnerId, studentNumber, organizationId });

  return h.response().code(204);
};

const supOrganizationLearnerController = { reconcileSupOrganizationLearner, updateStudentNumber };

export { supOrganizationLearnerController };
