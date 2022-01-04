const endTestScreenRemovalRepository = require('../../infrastructure/repositories/end-test-screen-removal-repository');

module.exports = {
  isEndTestScreenRemovalEnabledBySessionId: async function (sessionId) {
    const isEndTestScreenRemovalEnabled = await endTestScreenRemovalRepository.isEndTestScreenRemovalEnabledBySessionId(
      sessionId
    );
    return isEndTestScreenRemovalEnabled;
  },
  isEndTestScreenRemovalEnabledByCandidateId: async function (candidateId) {
    const isEndTestScreenRemovalEnabled =
      await endTestScreenRemovalRepository.isEndTestScreenRemovalEnabledByCandidateId(candidateId);
    return isEndTestScreenRemovalEnabled;
  },
};
