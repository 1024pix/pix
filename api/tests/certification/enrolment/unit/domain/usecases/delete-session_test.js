import sinon from 'sinon';

import { SessionStartedDeletionError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { deleteSession } from '../../../../../../src/certification/enrolment/domain/usecases/delete-session.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | delete-session', function () {
  beforeEach(async function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
  });
  context('when there are no certification courses', function () {
    it('should delete the session', async function () {
      // given
      const sessionRepository = { remove: sinon.stub() };
      const sessionManagementRepository = { hasNoStartedCertification: sinon.stub() };
      sessionManagementRepository.hasNoStartedCertification.resolves(true);
      sessionRepository.remove.withArgs({ id: 123 }).resolves(1);

      // when
      await deleteSession({
        sessionId: 123,
        sessionRepository,
        sessionManagementRepository,
      });

      // then
      expect(sessionRepository.remove).to.have.been.calledWithExactly({ id: 123 });
    });
  });

  context('when session does not exist', function () {
    it('throw a NotFoundError', async function () {
      // given
      const sessionId = 123;
      const sessionRepository = { remove: sinon.stub() };
      const sessionManagementRepository = {
        hasNoStartedCertification: sinon.stub(),
      };
      sessionManagementRepository.hasNoStartedCertification.resolves(true);
      sessionRepository.remove.withArgs({ id: sessionId }).resolves(null);

      // when
      const error = await catchErr(deleteSession)({
        sessionId,
        sessionRepository,
        sessionManagementRepository,
      });

      // then
      expect(error).to.deepEqualInstance(new NotFoundError("La session n'existe pas ou son accès est restreint"));
    });
  });

  context('when there are certification courses', function () {
    it('should throw SessionStartedDeletionError error', async function () {
      // given
      const sessionRepository = { remove: sinon.stub() };
      const sessionManagementRepository = { hasNoStartedCertification: sinon.stub() };
      sessionManagementRepository.hasNoStartedCertification.resolves(false);

      // when
      const error = await catchErr(deleteSession)({
        sessionId: 123,
        sessionRepository,
        sessionManagementRepository,
      });

      // then
      expect(error).to.be.instanceOf(SessionStartedDeletionError);
      expect(sessionRepository.remove).to.not.have.been.called;
    });
  });
});
