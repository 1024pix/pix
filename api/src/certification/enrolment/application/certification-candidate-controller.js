import { normalize } from '../../../shared/infrastructure/utils/string-utils.js';
import * as certificationCandidateSerializer from '../../shared/infrastructure/serializers/jsonapi/certification-candidate-serializer.js';
import { usecases } from '../domain/usecases/index.js';
import * as candidateSerializer from '../infrastructure/serializers/candidate-serializer.js';
import * as enrolledCandidateSerializer from '../infrastructure/serializers/enrolled-candidate-serializer.js';

const addCandidate = async function (request, h, dependencies = { candidateSerializer }) {
  const sessionId = request.params.id;
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
  const sessionId = request.params.id;
  const enrolledCandidates = await usecases.getEnrolledCandidatesInSession({ sessionId });
  return dependencies.enrolledCandidateSerializer.serialize(enrolledCandidates);
};

const deleteCandidate = async function (request) {
  const certificationCandidateId = request.params.certificationCandidateId;

  await usecases.deleteUnlinkedCertificationCandidate({ certificationCandidateId });

  return null;
};

const validateCertificationInstructions = async function (
  request,
  h,
  dependencies = { certificationCandidateSerializer },
) {
  const certificationCandidateId = request.params.certificationCandidateId;

  const updatedCandidate = await usecases.candidateHasSeenCertificationInstructions({
    certificationCandidateId,
  });

  return dependencies.certificationCandidateSerializer.serialize(updatedCandidate);
};

const certificationCandidateController = {
  addCandidate,
  getEnrolledCandidates,
  deleteCandidate,
  validateCertificationInstructions,
};
export { certificationCandidateController };
