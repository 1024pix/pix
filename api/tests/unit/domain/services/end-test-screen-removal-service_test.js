const { expect, sinon } = require('../../../test-helper');
const endTestScreenRemovalRepository = require('../../../../lib/infrastructure/repositories/end-test-screen-removal-repository');
const endTestScreenRemovalService = require('../../../../lib/domain/services/end-test-screen-removal-service');

describe('Unit | Domain | Service | EndTestScreenRemoval', function () {
  describe('#isEndTestScreenRemovalEnabledBySessionId', function () {
    it('should call repository with sessionId', async function () {
      // given
      const sessionId = Symbol('sessionId');
      sinon.spy(endTestScreenRemovalRepository, 'isEndTestScreenRemovalEnabledBySessionId');

      // when
      await endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId(sessionId);

      // then
      expect(endTestScreenRemovalRepository.isEndTestScreenRemovalEnabledBySessionId).to.be.calledWith(sessionId);
    });
  });

  describe('#isEndTestScreenRemovalEnabledByCandidateId', function () {
    it('should return value from repository', async function () {
      // given
      const candidateId = Symbol('candidateId');
      sinon.stub(endTestScreenRemovalRepository, 'isEndTestScreenRemovalEnabledByCandidateId');
      endTestScreenRemovalRepository.isEndTestScreenRemovalEnabledByCandidateId.withArgs(candidateId).resolves(false);

      // when
      const isEndTestScreenRemovalEnabled =
        await endTestScreenRemovalService.isEndTestScreenRemovalEnabledByCandidateId(candidateId);

      // then
      expect(isEndTestScreenRemovalEnabled).to.equals(false);
    });
  });
});
