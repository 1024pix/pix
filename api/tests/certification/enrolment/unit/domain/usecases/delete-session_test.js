import { SessionStartedDeletionError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { deleteSession } from '../../../../../../src/certification/enrolment/domain/usecases/delete-session.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | delete-session', function () {
  context('when there are no certification courses', function () {
    it('should delete the session', async function () {
      // given
      const sessionRepository = { remove: sinon.stub() };
      const sessionManagementRepository = { hasNoStartedCertification: sinon.stub() };
      sessionManagementRepository.hasNoStartedCertification.resolves(true);

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
