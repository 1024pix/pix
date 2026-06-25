import { normalize } from '../../../shared/infrastructure/utils/string-utils.js';
import { usecases } from '../domain/usecases/index.js';
import { candidateSerializer } from '../infrastructure/serializers/candidate-serializer.js';
import { timelineSerializer } from '../infrastructure/serializers/timeline-serializer.js';

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

const getEnrolledCandidates = async function (request, h, dependencies = { candidateSerializer }) {
  const sessionId = request.params.sessionId;
  const enrolledCandidates = await usecases.getEnrolledCandidatesInSession({ sessionId });
  return dependencies.candidateSerializer.serialize(enrolledCandidates);
};

const getSessionCandidates = async function (request, h, dependencies = { candidateSerializer }) {
  const sessionId = request.params.sessionId;
  const enrolledCandidates = await usecases.getEnrolledCandidatesInSession({ sessionId });
  return dependencies.candidateSerializer.serializeForSession(enrolledCandidates);
};

const deleteCandidate = async function (request, h) {
  const candidateId = request.params.certificationCandidateId;

  await usecases.deleteUnlinkedCertificationCandidate({ candidateId });

  return h.response().code(204);
};

const updateEnrolledCandidate = async function (request, h, dependencies = { candidateSerializer }) {
  const candidateId = request.params.certificationCandidateId;
  const enrolledCandidateData = request.payload.data.attributes;
  const editedCandidate = dependencies.candidateSerializer.deserializeForEdition({
    candidateId,
    candidateData: enrolledCandidateData,
  });

  await usecases.updateEnrolledCandidate({
    editedCandidate,
  });

  return h.response().code(204);
};

const validateCertificationInstructions = async function (request, h, dependencies = { candidateSerializer }) {
  const certificationCandidateId = request.params.certificationCandidateId;

  const candidate = await usecases.candidateHasSeenCertificationInstructions({
    certificationCandidateId,
  });

  return dependencies.candidateSerializer.serializeForParticipation(candidate);
};

const getCandidate = async function (request, h, dependencies = { candidateSerializer }) {
  const certificationCandidateId = request.params.certificationCandidateId;

  const candidate = await usecases.getCandidate({
    certificationCandidateId,
  });

  return dependencies.candidateSerializer.serializeForParticipation(candidate);
};

const getTimeline = async function (request, h, dependencies = { timelineSerializer }) {
  const certificationCandidateId = request.params.certificationCandidateId;

  const timeline = await usecases.getCandidateTimeline({
    certificationCandidateId,
  });

  return dependencies.timelineSerializer.serialize(timeline);
};

const certificationCandidateController = {
  addCandidate,
  getEnrolledCandidates,
  getSessionCandidates,
  getCandidate,
  getTimeline,
  deleteCandidate,
  validateCertificationInstructions,
  updateEnrolledCandidate,
};
export { certificationCandidateController };
