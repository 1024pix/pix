const { expect, sinon, domainBuilder } = require('../../../test-helper');
const findFinalizedSessionsToPublish = require('../../../../lib/domain/usecases/find-finalized-sessions-to-publish');

describe('Unit | UseCase | findFinalizedSessionsToPublish', () => {

  let finalizedSessionRepository;

  beforeEach(() => {
    finalizedSessionRepository = {
      findFinalizedSessionsToPublish: sinon.stub(),
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

      finalizedSessionRepository.findFinalizedSessionsToPublish.resolves(publishableSessions);
      // when
      const result = await findFinalizedSessionsToPublish({ finalizedSessionRepository });

      // then
      expect(result).to.deep.equal(publishableSessions);
    });
  });

  context('when there are no finalized publishable sessions', () => {

    it('should get an empty array', async () => {
      // given
      finalizedSessionRepository.findFinalizedSessionsToPublish.resolves([]);
      // when
      const result = await findFinalizedSessionsToPublish({ finalizedSessionRepository });

      // then
      expect(result).to.deep.equal([]);
    });
  });

});
