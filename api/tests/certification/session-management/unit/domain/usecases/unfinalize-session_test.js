import sinon from 'sinon';

import { SessionAlreadyPublishedError } from '../../../../../../src/certification/session-management/domain/errors.js';
import { unfinalizeSession } from '../../../../../../src/certification/session-management/domain/usecases/unfinalize-session.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | unfinalize-session', function () {
  let sessionManagementRepository;
  let finalizedSessionRepository;

  describe('when session is not published', function () {
    it('should call repositories with transaction', async function () {
      // given
      sinon.stub(DomainTransaction, 'execute').callsFake((fn) => fn({}));

      sessionManagementRepository = {
        unfinalize: sinon.stub(),
        isPublished: sinon.stub().resolves(false),
      };
      finalizedSessionRepository = {
        remove: sinon.stub(),
      };

      // when
      await unfinalizeSession({ sessionId: 99, sessionManagementRepository, finalizedSessionRepository });

      // then
      expect(sessionManagementRepository.unfinalize).to.have.been.calledWithMatch({
        id: 99,
      });

      expect(sessionManagementRepository.isPublished).to.have.been.calledWithMatch({ id: 99 });

      expect(finalizedSessionRepository.remove).to.have.been.calledWithMatch({
        sessionId: 99,
      });
    });
  });

  describe('when session is published', function () {
    it('should throw an SessionAlreadyPublishedError', async function () {
      // given
      sessionManagementRepository = {
        isPublished: sinon.stub().resolves(true),
      };

      // when
      const error = await catchErr(unfinalizeSession)({ sessionId: 99, sessionManagementRepository });

      // then
      expect(error).to.be.instanceOf(SessionAlreadyPublishedError);
    });
  });
});
