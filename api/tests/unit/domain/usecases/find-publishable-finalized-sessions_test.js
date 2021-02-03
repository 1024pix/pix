const { expect, sinon, domainBuilder } = require('../../../test-helper');
const findPublishableFinalizedSessions = require('../../../../lib/domain/usecases/find-publishable-finalized-sessions');

describe('Unit | UseCase | findPublishableFinalizedSessions', () => {

  let finalizedSessionRepository;

  beforeEach(() => {
    finalizedSessionRepository = {
      findPublishableSessions: sinon.stub(),
    };
  });

  context('when there are finalized publishable sessions', () => {

    it('should get a list of publishable sessions', async () => {
      // given
      const publishableSessions = [
        domainBuilder.buildFinalizedSession({ isPublishable: true }),
        domainBuilder.buildFinalizedSession({ isPublishable: true }),
        domainBuilder.buildFinalizedSession({ isPublishable: true }),
      ];

      finalizedSessionRepository.findPublishableSessions.resolves(publishableSessions);
      // when
      const result = await findPublishableFinalizedSessions({ finalizedSessionRepository });

      // then
      expect(result).to.deep.equal(publishableSessions);
    });
  });

  context('when there are no finalized publishable sessions', () => {

    it('should get an empty array', async () => {
      // given
      finalizedSessionRepository.findPublishableSessions.resolves([]);
      // when
      const result = await findPublishableFinalizedSessions({ finalizedSessionRepository });

      // then
      expect(result).to.deep.equal([]);
    });
  });

});
