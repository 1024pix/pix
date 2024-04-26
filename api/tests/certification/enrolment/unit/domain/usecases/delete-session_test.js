import { deleteSession } from '../../../../../../src/certification/enrollment/domain/usecases/delete-session.js';
import { SessionStartedDeletionError } from '../../../../../../src/certification/session/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | delete-session', function () {
  context('when there are no certification courses', function () {
    it('should delete the session', async function () {
      // given
      const sessionRepository = { remove: sinon.stub() };
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      certificationCourseRepository.findCertificationCoursesBySessionId.resolves([]);

      // when
      await deleteSession({
        sessionId: 123,
        sessionRepository,
        certificationCourseRepository,
      });

      // then
      expect(sessionRepository.remove).to.have.been.calledWithExactly({ id: 123 });
    });
  });

  context('when there are certification courses', function () {
    it('should throw SessionStartedDeletionError error', async function () {
      // given
      const sessionRepository = { remove: sinon.stub() };
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      certificationCourseRepository.findCertificationCoursesBySessionId.resolves([
        domainBuilder.buildCertificationCourse({ sessionId: 123 }),
      ]);

      // when
      const error = await catchErr(deleteSession)({
        sessionId: 123,
        sessionRepository,
        certificationCourseRepository,
      });

      // then
      expect(error).to.be.instanceOf(SessionStartedDeletionError);
      expect(sessionRepository.remove).to.not.have.been.called;
    });
  });
});
