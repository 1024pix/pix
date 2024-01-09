import * as certificationCandidateSerializer from '../../shared/infrastructure/serializers/jsonapi/certification-candidate-serializer.js';
import * as sessionCertificationCandidateSerializer from '../../session/infrastructure/serializers/jsonapi/certification-candidate-serializer.js';
import { usecases as sharedUsecases } from '../../shared/domain/usecases/index.js';
import { usecases } from '../domain/usecases/index.js';

const addCandidate = async function (request, h, dependencies = { certificationCandidateSerializer }) {
  const sessionId = request.params.id;
  const certificationCandidate = await dependencies.certificationCandidateSerializer.deserialize(request.payload);
  const complementaryCertification = request.payload.data.attributes['complementary-certification'] ?? null;
  const addedCertificationCandidate = await sharedUsecases.addCertificationCandidateToSession({
    sessionId,
    certificationCandidate,
    complementaryCertification,
  });

  return h.response(dependencies.certificationCandidateSerializer.serialize(addedCertificationCandidate)).created();
};

const getCandidate = async function (request, h, dependencies = { sessionCertificationCandidateSerializer }) {
  const sessionId = request.params.id;

  const certificationCandidates = await usecases.getSessionCertificationCandidates({ sessionId });
  return dependencies.sessionCertificationCandidateSerializer.serialize(certificationCandidates);
};

const deleteCandidate = async function (request) {
  const certificationCandidateId = request.params.certificationCandidateId;

  await sharedUsecases.deleteUnlinkedCertificationCandidate({ certificationCandidateId });

  return null;
};

const certificationCandidateController = {
  addCandidate,
  getCandidate,
  deleteCandidate,
};
export { certificationCandidateController };
