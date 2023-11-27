import * as certificationCandidateSerializer from '../../shared/infrastructure/serializers/jsonapi/certification-candidate-serializer.js';
import { usecases } from '../../shared/domain/usecases/index.js';

const add = async function (request, h, dependencies = { certificationCandidateSerializer }) {
  const sessionId = request.params.id;
  const certificationCandidate = await dependencies.certificationCandidateSerializer.deserialize(request.payload);
  const complementaryCertification = request.payload.data.attributes['complementary-certification'] ?? null;
  const addedCertificationCandidate = await usecases.addCertificationCandidateToSession({
    sessionId,
    certificationCandidate,
    complementaryCertification,
  });

  return h.response(dependencies.certificationCandidateSerializer.serialize(addedCertificationCandidate)).created();
};

const get = async function (request, h, dependencies = { certificationCandidateSerializer }) {
  const sessionId = request.params.id;

  const certificationCandidates = await usecases.getSessionCertificationCandidates({ sessionId });
  return dependencies.certificationCandidateSerializer.serialize(certificationCandidates);
};

const deleteCandidate = async function (request) {
  const certificationCandidateId = request.params.certificationCandidateId;

  await usecases.deleteUnlinkedCertificationCandidate({ certificationCandidateId });

  return null;
};

const certificationCandidateController = {
  add,
  get,
  deleteCandidate,
};
export { certificationCandidateController };
