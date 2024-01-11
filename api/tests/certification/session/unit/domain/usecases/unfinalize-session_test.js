import { catchErr, expect, sinon } from '../../../../../test-helper.js';
import { unfinalizeSession } from '../../../../../../src/certification/session/domain/usecases/unfinalize-session.js';
import { knex } from '../../../../../../db/knex-database-connection.js';
import { SessionAlreadyPublishedError } from '../../../../../../src/certification/session/domain/errors.js';

describe('Unit | UseCase | unfinalize-session', function () {
  let sessionRepository;
  let finalizedSessionRepository;

  describe('when session is not published', function () {
    it('should call repositories with transaction', async function () {
      // given
      sinon.stub(knex, 'transaction').callsFake((fn) => fn());

      sessionRepository = {
        unfinalize: sinon.stub(),
        isPublished: sinon.stub().resolves(false),
      };
      finalizedSessionRepository = {
        remove: sinon.stub(),
      };

      // when
      await unfinalizeSession({ sessionId: 99, sessionRepository, finalizedSessionRepository });

      // then
      expect(sessionRepository.unfinalize).to.have.been.calledWithMatch({
        sessionId: 99,
        domainTransaction: sinon.match.object,
      });

      expect(sessionRepository.isPublished).to.have.been.calledWithMatch(99);

      expect(finalizedSessionRepository.remove).to.have.been.calledWithMatch({
        sessionId: 99,
        domainTransaction: sinon.match.object,
      });
    });
  });

  describe('when session is published', function () {
    it('should throw an SessionAlreadyPublishedError', async function () {
      // given
      sessionRepository = {
        isPublished: sinon.stub().resolves(true),
      };

      // when
      const error = await catchErr(unfinalizeSession)({ sessionId: 99, sessionRepository });

      // then
      expect(error).to.be.instanceOf(SessionAlreadyPublishedError);
    });
  });
});
