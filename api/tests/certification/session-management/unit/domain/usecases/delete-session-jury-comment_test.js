import { deleteSessionJuryComment } from '../../../../../../src/certification/session-management/domain/usecases/delete-session-jury-comment.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | Certification | session-management  | delete-session-jury-comment', function () {
  it('should delete the session jury comment', async function () {
    // given
    const sessionJuryCommentRepository = { remove: sinon.stub() };

    // when
    await deleteSessionJuryComment({
      sessionId: 123,
      sessionJuryCommentRepository,
    });

    // then
    expect(sessionJuryCommentRepository.remove).to.have.been.calledWithExactly({ id: 123 });
  });
});
