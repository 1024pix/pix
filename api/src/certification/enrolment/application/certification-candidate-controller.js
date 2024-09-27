import { normalize } from '../../../shared/infrastructure/utils/string-utils.js';
import * as certificationCandidateSerializer from '../../shared/infrastructure/serializers/jsonapi/certification-candidate-serializer.js';
import { usecases } from '../domain/usecases/index.js';
import * as candidateSerializer from '../infrastructure/serializers/candidate-serializer.js';
import * as enrolledCandidateSerializer from '../infrastructure/serializers/enrolled-candidate-serializer.js';

const addCandidate = async function (request, h, dependencies = { candidateSerializer }) {
  const sessionId = request.params.sessionId;
  const candidate = await dependencies.candidateSerializer.deserialize(request.payload);
  const candidateId = await usecases.addCandidateToSession({
    sessionId,
    candidate,
    normalizeStringFnc: normalize,
  });

  const serializedId = candidateSerializer.serializeId(candidateId);
  return h.response(serializedId).created();
};

const getEnrolledCandidates = async function (request, h, dependencies = { enrolledCandidateSerializer }) {
  const sessionId = request.params.sessionId;
  const enrolledCandidates = await usecases.getEnrolledCandidatesInSession({ sessionId });
  return dependencies.enrolledCandidateSerializer.serialize(enrolledCandidates);
};

const deleteCandidate = async function (request, h) {
  const candidateId = request.params.certificationCandidateId;

  await usecases.deleteUnlinkedCertificationCandidate({ candidateId });

  return h.response().code(204);
};

const updateEnrolledCandidate = async function (request, h, dependencies = { enrolledCandidateSerializer }) {
  const candidateId = request.params.certificationCandidateId;
  const enrolledCandidateData = request.payload.data.attributes;
  const editedCandidate = dependencies.enrolledCandidateSerializer.deserialize({
    candidateId,
    candidateData: enrolledCandidateData,
  });

  await usecases.updateEnrolledCandidate({
    editedCandidate,
  });

  return h.response().code(204);
};

const validateCertificationInstructions = async function (
  request,
  h,
  dependencies = { certificationCandidateSerializer },
) {
  const certificationCandidateId = request.params.certificationCandidateId;

  const candidate = await usecases.candidateHasSeenCertificationInstructions({
    certificationCandidateId,
  });

  return dependencies.certificationCandidateSerializer.serialize(candidate);
};

const certificationCandidateController = {
  addCandidate,
  getEnrolledCandidates,
  deleteCandidate,
  validateCertificationInstructions,
  updateEnrolledCandidate,
};
export { certificationCandidateController };
