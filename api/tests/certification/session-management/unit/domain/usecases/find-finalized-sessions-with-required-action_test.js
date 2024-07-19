import { findFinalizedSessionsWithRequiredAction } from '../../../../../../src/certification/session-management/domain/usecases/find-finalized-sessions-with-required-action.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Session-management | Unit | Domain | UseCases | findFinalizedSessionsWithRequiredAction', function () {
  context('when there are finalized sessions with required actions', function () {
    it('should get a list of publishable sessions', async function () {
      // given
      const finalizedSessionRepository = {
        findFinalizedSessionsWithRequiredAction: sinon.stub(),
      };

      const sessionsWithRequiredActions = [
        {
          ...domainBuilder.buildFinalizedSession({ isPublishable: false, publishedAt: null }),
          version: 2,
        },
      ];

      finalizedSessionRepository.findFinalizedSessionsWithRequiredAction.resolves(sessionsWithRequiredActions);
      // when
      const result = await findFinalizedSessionsWithRequiredAction({ finalizedSessionRepository });

      // then
      expect(result).to.deep.equal(sessionsWithRequiredActions);
    });
    context('when filtering on a specific version', function () {
      it('should get a list of publishable sessions', async function () {
        // given
        const finalizedSessionRepository = {
          findFinalizedSessionsWithRequiredAction: sinon.stub(),
        };

        const sessionsWithRequiredActions = [
          {
            ...domainBuilder.buildFinalizedSession({ isPublishable: false, publishedAt: null }),
            version: 3,
          },
        ];

        finalizedSessionRepository.findFinalizedSessionsWithRequiredAction
          .withArgs({ version: 3 })
          .resolves(sessionsWithRequiredActions);
        // when
        const result = await findFinalizedSessionsWithRequiredAction({ finalizedSessionRepository, version: 3 });

        // then
        expect(result).to.deep.equal(sessionsWithRequiredActions);
      });
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
