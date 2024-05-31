import { commentSessionAsJury } from '../../../../../../src/certification/session-management/domain/usecases/comment-session-as-jury.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | Certification | session-management | comment-session-as-jury', function () {
  const sessionJuryCommentRepository = { get: null, save: null };

  beforeEach(function () {
    sessionJuryCommentRepository.get = sinon.stub();
    sessionJuryCommentRepository.save = sinon.stub();
  });

  it('should update the session jury comment', async function () {
    // given
    const sessionJuryComment = domainBuilder.buildSessionJuryComment({
      juryCommentAuthorId: 789,
    });
    sessionJuryCommentRepository.get.withArgs({ id: 123 }).resolves(sessionJuryComment);
    const updateSpy = sinon.spy(sessionJuryComment, 'update');

    // when
    await commentSessionAsJury({
      sessionId: 123,
      juryComment: 'a jury comment',
      juryCommentAuthorId: 456,
      sessionJuryCommentRepository,
    });

    // then
    expect(updateSpy).to.have.been.calledWithExactly({
      comment: 'a jury comment',
      authorId: 456,
    });
    expect(sessionJuryCommentRepository.save).to.have.been.calledWithExactly({ sessionJuryComment });
  });
});
