import sinon from 'sinon';

import { SessionAlreadyPublishedError } from '../../../../../../src/certification/session-management/domain/errors.js';
import { unfinalizeSession } from '../../../../../../src/certification/session-management/domain/usecases/unfinalize-session.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | unfinalize-session', function () {
  let sessionManagementRepository;
  let finalizedSessionRepository;

  describe('when session does not exist', function () {
    it('throws a NotFoundError', async function () {
      // given
      sinon.stub(DomainTransaction, 'execute').callsFake((fn) => fn({}));

      const sessionId = 123;
      sessionManagementRepository = {
        unfinalize: sinon.stub(),
        isPublished: sinon.stub(),
      };
      finalizedSessionRepository = {
        remove: sinon.stub(),
      };

      sessionManagementRepository.isPublished.withArgs({ id: sessionId }).resolves(false);
      finalizedSessionRepository.remove.withArgs({ sessionId }).resolves(null);

      // when
      const error = await catchErr(unfinalizeSession)({
        sessionId,
        sessionManagementRepository,
        finalizedSessionRepository,
      });

      // then
      expect(error).to.deepEqualInstance(new NotFoundError("La session n'existe pas ou son accès est restreint"));
      expect(sessionManagementRepository.unfinalize).to.not.have.been.called;
    });
  });

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
      finalizedSessionRepository.remove.withArgs({ sessionId: 99 }).resolves(1);

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
