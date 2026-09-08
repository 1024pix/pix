import { normalize } from '../../../shared/infrastructure/utils/string-utils.js';
import { usecases } from '../domain/usecases/index.js';
import { candidateSerializer } from '../infrastructure/serializers/candidate-serializer.js';
import { timelineSerializer } from '../infrastructure/serializers/timeline-serializer.js';

async function addCandidate(request, h, dependencies = { candidateSerializer }) {
  const sessionId = request.params.sessionId;
  const candidate = await dependencies.candidateSerializer.deserialize(request.payload);
  const candidateId = await usecases.addCandidateToSession({
    sessionId,
    candidate,
    normalizeStringFnc: normalize,
  });

  const serializedId = candidateSerializer.serializeId(candidateId);
  return h.response(serializedId).created();
}

async function getEnrolledCandidates(request, h, dependencies = { candidateSerializer }) {
  const sessionId = request.params.sessionId;
  const enrolledCandidates = await usecases.getEnrolledCandidatesInSession({ sessionId });
  return dependencies.candidateSerializer.serialize(enrolledCandidates);
}

async function getSessionCandidates(request, h, dependencies = { candidateSerializer }) {
  const sessionId = request.params.sessionId;
  const enrolledCandidates = await usecases.getEnrolledCandidatesInSession({ sessionId });
  return dependencies.candidateSerializer.serializeForSession(enrolledCandidates);
}

async function deleteCandidate(request, h) {
  const candidateId = request.params.certificationCandidateId;

  await usecases.deleteUnlinkedCertificationCandidate({ candidateId });

  return h.response().code(204);
}

async function updateEnrolledCandidate(request, h, dependencies = { candidateSerializer }) {
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
}

async function validateCertificationInstructions(request, h, dependencies = { candidateSerializer }) {
  const certificationCandidateId = request.params.certificationCandidateId;

  const candidate = await usecases.candidateHasSeenCertificationInstructions({
    certificationCandidateId,
  });

  return dependencies.candidateSerializer.serializeForParticipation(candidate);
}

async function getCandidate(request, h, dependencies = { candidateSerializer }) {
  const certificationCandidateId = request.params.certificationCandidateId;

  const candidate = await usecases.getCandidate({
    certificationCandidateId,
  });

  return dependencies.candidateSerializer.serializeForParticipation(candidate);
}

async function getTimeline(request, h, dependencies = { timelineSerializer }) {
  const certificationCandidateId = request.params.certificationCandidateId;

  const timeline = await usecases.getCandidateTimeline({
    certificationCandidateId,
  });

  return dependencies.timelineSerializer.serialize(timeline);
}

export const certificationCandidateController = {
  addCandidate,
  getEnrolledCandidates,
  getSessionCandidates,
  getCandidate,
  getTimeline,
  deleteCandidate,
  validateCertificationInstructions,
  updateEnrolledCandidate,
};
