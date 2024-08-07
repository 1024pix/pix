import { Serializer } from 'jsonapi-serializer';

import * as certificationCandidateSerializer from '../../shared/infrastructure/serializers/jsonapi/certification-candidate-serializer.js';
import { usecases } from '../domain/usecases/index.js';
import * as enrolledCandidateSerializer from '../infrastructure/serializers/enrolled-candidate-serializer.js';

const addCandidate = async function (request, h, dependencies = { certificationCandidateSerializer }) {
  const sessionId = request.params.id;
  const certificationCandidate = await dependencies.certificationCandidateSerializer.deserialize(request.payload);
  const subscription = _getSubscriptionParameter(request) ?? null;
  const certificationCandidateId = await usecases.addCertificationCandidateToSession({
    sessionId,
    certificationCandidate,
    subscription,
  });

  return h
    .response(new Serializer('certification-candidate', {}).serialize({ id: certificationCandidateId }))
    .created();
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

const _getSubscriptionParameter = (request) => {
  const { attributes } = request.payload.data;
  return attributes['subscription'] ?? attributes['complementary-certification'];
};

const certificationCandidateController = {
  addCandidate,
  getEnrolledCandidates,
  deleteCandidate,
  validateCertificationInstructions,
};
export { certificationCandidateController };
