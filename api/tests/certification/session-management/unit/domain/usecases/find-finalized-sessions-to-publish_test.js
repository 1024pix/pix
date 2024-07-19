import { findFinalizedSessionsToPublish } from '../../../../../../src/certification/session-management/domain/usecases/find-finalized-sessions-to-publish.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

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

  context('when filtering on a specific version', function () {
    it('should get a list of publishable sessions', async function () {
      // given
      const finalizedSessionRepository = {
        findFinalizedSessionsToPublish: sinon.stub(),
      };

      const v3PublishableSession = {
        ...domainBuilder.buildFinalizedSession({ isPublishable: true, publishedAt: null }),
        version: 3,
      };

      finalizedSessionRepository.findFinalizedSessionsToPublish.withArgs({ version: 3 }).resolves(v3PublishableSession);
      // when
      const result = await findFinalizedSessionsToPublish({ finalizedSessionRepository, version: 3 });

      // then
      expect(result).to.deep.equal(v3PublishableSession);
    });
  });
});
