import { usecases } from '../../../domain/usecases/index.js';
import * as certificationCandidateSerializer from '../../../infrastructure/serializers/jsonapi/certification-candidate-serializer.js';

const addCertificationCandidate = async function (request, h, dependencies = { certificationCandidateSerializer }) {
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

const sessionController = {
  addCertificationCandidate,
};

export { sessionController };
