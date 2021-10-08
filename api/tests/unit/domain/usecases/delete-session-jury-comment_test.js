const { expect, sinon } = require('../../../test-helper');
const deleteSessionJuryComment = require('../../../../lib/domain/usecases/delete-session-jury-comment');

describe('Unit | UseCase | delete-session-jury-comment', function () {
  it('should delete the session jury comment', async function () {
    // given
    const sessionJuryCommentRepository = { delete: sinon.stub() };

    // when
    await deleteSessionJuryComment({
      sessionId: 123,
      sessionJuryCommentRepository,
    });

    // then
    expect(sessionJuryCommentRepository.delete).to.have.been.calledWithExactly(123);
  });
});
