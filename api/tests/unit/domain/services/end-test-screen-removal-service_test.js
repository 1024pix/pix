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
});
