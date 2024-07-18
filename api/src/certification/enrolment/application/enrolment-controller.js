import * as requestResponseUtils from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as certificationCandidateSerializer from '../infrastructure/serializers/certification-candidate-serializer.js';

const enrolStudentsToSession = async function (
  request,
  h,
  dependencies = { certificationCandidateSerializer, requestResponseUtils },
) {
  const referentId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const sessionId = request.params.id;
  const studentIds = request.deserializedPayload.organizationLearnerIds;

  await usecases.enrolStudentsToSession({ sessionId, referentId, studentIds });
  const certificationCandidates = await usecases.getSessionCertificationCandidates({ sessionId });
  const certificationCandidatesSerialized =
    dependencies.certificationCandidateSerializer.serialize(certificationCandidates);
  return h.response(certificationCandidatesSerialized).created();
};

const enrolmentController = {
  enrolStudentsToSession,
};

export { enrolmentController };
