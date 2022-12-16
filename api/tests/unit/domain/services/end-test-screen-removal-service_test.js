const { expect, sinon } = require('../../../test-helper');
const endTestScreenRemovalRepository = require('../../../../lib/infrastructure/repositories/end-test-screen-removal-repository');
const endTestScreenRemovalService = require('../../../../lib/domain/services/end-test-screen-removal-service');

describe('Unit | Domain | Service | EndTestScreenRemoval', function () {
  describe('#isEndTestScreenRemovalEnabledBySessionId', function () {
    it('should return value from repository', async function () {
      // given
      const sessionId = Symbol('sessionId');
      sinon.stub(endTestScreenRemovalRepository, 'isEndTestScreenRemovalEnabledBySessionId');
      endTestScreenRemovalRepository.isEndTestScreenRemovalEnabledBySessionId.withArgs(sessionId).resolves(false);

      // when
      const isEndTestScreenRemovalEnabled = await endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId(
        sessionId
      );

      // then
      expect(isEndTestScreenRemovalEnabled).to.equals(false);
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

    describe('#isEndTestScreenRemovalEnabledByCertificationCenterId', function () {
      it('should return value from repository', async function () {
        // given
        const certificationCenterId = Symbol('certificationCenterId');
        sinon.stub(endTestScreenRemovalRepository, 'isEndTestScreenRemovalEnabledByCertificationCenterId');
        endTestScreenRemovalRepository.isEndTestScreenRemovalEnabledByCertificationCenterId
          .withArgs(certificationCenterId)
          .resolves(false);

        // when
        const isEndTestScreenRemovalEnabled =
          await endTestScreenRemovalService.isEndTestScreenRemovalEnabledByCertificationCenterId(certificationCenterId);

        // then
        expect(isEndTestScreenRemovalEnabled).to.equals(false);
      });
    });

    describe('#isEndTestScreenRemovalEnabledForSomeCertificationCenter', function () {
      it('should return value from repository', async function () {
        // given
        sinon.stub(endTestScreenRemovalRepository, 'isEndTestScreenRemovalEnabledForSomeCertificationCenter');
        endTestScreenRemovalRepository.isEndTestScreenRemovalEnabledForSomeCertificationCenter.resolves(false);

        // when
        const isEndTestScreenRemovalEnabled =
          await endTestScreenRemovalService.isEndTestScreenRemovalEnabledForSomeCertificationCenter();

        // then
        expect(isEndTestScreenRemovalEnabled).to.equals(false);
      });
    });
  });
});
