import { deleteSession } from '../../../../../../src/certification/enrolment/application/api/sessions-api.js';
import { SessionStartedDeletionError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { usecases } from '../../../../../../src/certification/enrolment/domain/usecases/index.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | API | sessions-api', function () {
  describe('deleteSession', function () {
    it('should delete sessions', async function () {
      // given
      sinon.stub(usecases, 'deleteSession').resolves();

      // when
      await deleteSession({ sessionId: 12 });

      // then
      expect(usecases.deleteSession).to.have.been.calledOnceWithExactly({ sessionId: 12 });
    });

    it('should reject calls without a sessionId', async function () {
      // given
      sinon.stub(usecases, 'deleteSession').resolves();

      // when
      const error = await catchErr(() => deleteSession({ sessionId: null }))();

      // then
      expect(error).to.be.instanceOf(TypeError);
      expect(error.message).to.equals('session identifier is required');
    });

    describe('when session has started', function () {
      it('should delete sessions', async function () {
        // given
        sinon.stub(usecases, 'deleteSession').throws(new SessionStartedDeletionError());

        // when
        const error = await catchErr(() => deleteSession({ sessionId: 12 }))();

        // then
        expect(error).to.be.instanceOf(SessionStartedDeletionError);
        expect(error.message).to.equals('La session a déjà commencé.');
        expect(error.code).to.equals('SESSION_STARTED_DELETION_ERROR');
      });
    });
  });
});
