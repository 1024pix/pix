const usecases = require('../../domain/usecases');
const certificationCandidateSerializer = require('../../infrastructure/serializers/jsonapi/certification-candidate-serializer');

module.exports = {

  async get(request) {
    const userId = request.auth.credentials.userId;
    const certificationCandidateId = request.params.id;
    const certificationCandidate = await usecases.getCertificationCandidate({ userId, certificationCandidateId });

    return certificationCandidateSerializer.serialize(certificationCandidate);
  },

  async save(request) {
    const userId = request.auth.credentials.userId;
    const certificationCandidate = await certificationCandidateSerializer.deserialize(request.payload);

    const newCertificationCandidate = await usecases.createCertificationCandidate({ userId, certificationCandidate });

    return certificationCandidateSerializer.serialize(newCertificationCandidate);
  },

  async delete(request) {
    const userId = request.auth.credentials.userId;
    const certificationCandidateId = request.params.id;
    const deletedCertificationCandidate = await usecases.deleteCertificationCandidate({ userId, certificationCandidateId });

    return certificationCandidateSerializer.serialize(deletedCertificationCandidate);
  },
};
