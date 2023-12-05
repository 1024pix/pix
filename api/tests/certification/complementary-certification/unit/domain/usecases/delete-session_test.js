import { expect, sinon, domainBuilder, catchErr } from '../../../../../test-helper.js';
import { deleteSession } from '../../../../../../src/certification/session/domain/usecases/delete-session.js';
import { SessionStartedDeletionError } from '../../../../../../src/certification/session/domain/errors.js';

describe('Unit | UseCase | delete-session', function () {
  context('when there are no certification courses', function () {
    it('should delete the session', async function () {
      // given
      const sessionRepository = { remove: sinon.stub() };
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      certificationCourseRepository.findCertificationCoursesBySessionId.resolves([]);

      // when
      await new deleteSession({
        sessionRepository,
        certificationCourseRepository,
      }).execute({ sessionId: 123 });

      // then
      expect(sessionRepository.remove).to.have.been.calledWithExactly(123);
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
      const service = new deleteSession({
        sessionRepository,
        certificationCourseRepository,
      });
      const error = await catchErr(service.execute, service)({ sessionId: 123 });

      // then
      expect(error).to.be.instanceOf(SessionStartedDeletionError);
      expect(sessionRepository.remove).to.not.have.been.called;
    });
  });
});
