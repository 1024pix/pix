import { expect } from 'chai';
import sinon from 'sinon';

import {
  SessionAlreadyPublishedError,
  SessionNotFinalizedError,
} from '../../../../../../src/certification/session-management/domain/errors.js';
import { unfinalizeSession } from '../../../../../../src/certification/session-management/domain/usecases/unfinalize-session.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | unfinalize-session', function () {
  let sessionManagementRepository;
  let finalizedSessionRepository;

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((fn) => fn({}));

    sessionManagementRepository = {
      get: sinon.stub(),
      unfinalize: sinon.stub(),
    };
    finalizedSessionRepository = {
      remove: sinon.stub(),
    };
  });

  describe('when session does not exist', function () {
    it('throws a NotFoundError', async function () {
      // given
      const sessionId = 123;
      sessionManagementRepository.get.withArgs({ id: sessionId }).resolves(null);

      // when
      const error = await catchErr(unfinalizeSession)({
        sessionId,
        sessionManagementRepository,
        finalizedSessionRepository,
      });

      // then
      expect(error).to.deepEqualInstance(new NotFoundError("La session n'existe pas ou son accès est restreint"));
      expect(finalizedSessionRepository.remove).to.not.have.been.called;
      expect(sessionManagementRepository.unfinalize).to.not.have.been.called;
    });
  });

  describe('when session is published', function () {
    it('throws a SessionAlreadyPublishedError', async function () {
      // given
      const sessionId = 99;
      sessionManagementRepository.get.withArgs({ id: sessionId }).resolves(
        domainBuilder.certification.sessionManagement.buildSessionManagement({
          finalizedAt: new Date('2020-01-01'),
          publishedAt: new Date('2020-01-02'),
        }),
      );

      // when
      const error = await catchErr(unfinalizeSession)({
        sessionId,
        sessionManagementRepository,
        finalizedSessionRepository,
      });

      // then
      expect(error).to.be.instanceOf(SessionAlreadyPublishedError);
      expect(finalizedSessionRepository.remove).to.not.have.been.called;
      expect(sessionManagementRepository.unfinalize).to.not.have.been.called;
    });
  });

  describe('when session is not finalized', function () {
    it('throws a SessionNotFinalizedError', async function () {
      // given
      const sessionId = 99;
      sessionManagementRepository.get.withArgs({ id: sessionId }).resolves(
        domainBuilder.certification.sessionManagement.buildSessionManagement({
          finalizedAt: null,
          publishedAt: null,
        }),
      );

      // when
      const error = await catchErr(unfinalizeSession)({
        sessionId,
        sessionManagementRepository,
        finalizedSessionRepository,
      });

      // then
      expect(error).to.deepEqualInstance(new SessionNotFinalizedError());
      expect(finalizedSessionRepository.remove).to.not.have.been.called;
      expect(sessionManagementRepository.unfinalize).to.not.have.been.called;
    });
  });

  describe('when session is finalized and not published', function () {
    it('removes the finalized session and unfinalizes the session within a transaction', async function () {
      // given
      const sessionId = 99;
      sessionManagementRepository.get.withArgs({ id: sessionId }).resolves(
        domainBuilder.certification.sessionManagement.buildSessionManagement({
          finalizedAt: new Date('2020-01-01'),
          publishedAt: null,
        }),
      );
      finalizedSessionRepository.remove.withArgs({ sessionId }).resolves(1);

      // when
      await unfinalizeSession({ sessionId, sessionManagementRepository, finalizedSessionRepository });

      // then
      expect(DomainTransaction.execute).to.have.been.calledOnce;
      expect(finalizedSessionRepository.remove).to.have.been.calledWithExactly({ sessionId });
      expect(sessionManagementRepository.unfinalize).to.have.been.calledWithExactly({ id: sessionId });
    });
  });
});
