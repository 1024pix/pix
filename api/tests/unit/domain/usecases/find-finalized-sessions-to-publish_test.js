import { expect, sinon, domainBuilder } from '../../../test-helper';
import findFinalizedSessionsToPublish from '../../../../lib/domain/usecases/find-finalized-sessions-to-publish';

describe('Unit | UseCase | findFinalizedSessionsToPublish', function () {
  let finalizedSessionRepository;

  beforeEach(function () {
    finalizedSessionRepository = {
      findFinalizedSessionsToPublish: sinon.stub(),
    };
  });

  context('when there are finalized publishable sessions', function () {
    it('should get a list of publishable sessions', async function () {
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

  context('when there are no finalized publishable sessions', function () {
    it('should get an empty array', async function () {
      // given
      finalizedSessionRepository.findFinalizedSessionsToPublish.resolves([]);
      // when
      const result = await findFinalizedSessionsToPublish({ finalizedSessionRepository });

      // then
      expect(result).to.deep.equal([]);
    });
  });
});
