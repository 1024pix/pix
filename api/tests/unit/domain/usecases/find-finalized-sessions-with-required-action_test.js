import { expect, sinon, domainBuilder } from '../../../test-helper';
import findFinalizedSessionsWithRequiredAction from '../../../../lib/domain/usecases/find-finalized-sessions-with-required-action';

describe('Unit | UseCase | findFinalizedSessionsWithRequiredAction', function () {
  context('when there are finalized sessions with required actions', function () {
    it('should get a list of publishable sessions', async function () {
      // given
      const finalizedSessionRepository = {
        findFinalizedSessionsWithRequiredAction: sinon.stub(),
      };

      const sessionsWithRequiredActions = [
        domainBuilder.buildFinalizedSession({ isPublishable: false, publishedAt: null }),
      ];

      finalizedSessionRepository.findFinalizedSessionsWithRequiredAction.resolves(sessionsWithRequiredActions);
      // when
      const result = await findFinalizedSessionsWithRequiredAction({ finalizedSessionRepository });

      // then
      expect(result).to.deep.equal(sessionsWithRequiredActions);
    });
  });

  context('when there are no finalized sessions with required action', function () {
    it('should get an empty array', async function () {
      // given
      const finalizedSessionRepository = {
        findFinalizedSessionsWithRequiredAction: sinon.stub(),
      };
      finalizedSessionRepository.findFinalizedSessionsWithRequiredAction.resolves([]);
      // when
      const result = await findFinalizedSessionsWithRequiredAction({ finalizedSessionRepository });

      // then
      expect(result).to.deep.equal([]);
    });
  });
});
