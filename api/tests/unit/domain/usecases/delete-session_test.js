import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import deleteSession from '../../../../lib/domain/usecases/delete-session';
import { SessionStartedDeletionError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | delete-session', function () {
  context('when there are no certification courses', function () {
    it('should delete the session', async function () {
      // given
      const sessionRepository = { delete: sinon.stub() };
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      certificationCourseRepository.findCertificationCoursesBySessionId.resolves([]);

      // when
      await deleteSession({
        sessionId: 123,
        sessionRepository,
        certificationCourseRepository,
      });

      // then
      expect(sessionRepository.delete).to.have.been.calledWithExactly(123);
    });
  });

  context('when there are certification courses', function () {
    it('should throw SessionStartedDeletionError error', async function () {
      // given
      const sessionRepository = { delete: sinon.stub() };
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
      expect(sessionRepository.delete).to.not.have.been.called;
    });
  });
});
