import { juryCommentController } from '../../../../../src/certification/session-management/application/jury-comment-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | Certification | session-management | jury-comment-controller', function () {
  describe('#commentAsJury', function () {
    it('should update the session with a comment', async function () {
      // given
      const sessionId = 1;
      const userId = 1;
      sinon.stub(usecases, 'commentSessionAsJury');
      const request = {
        params: { id: sessionId },
        auth: {
          credentials: {
            userId,
          },
        },
        payload: {
          'jury-comment': 'Un commentaire du pôle certif',
        },
      };

      // when
      await juryCommentController.commentAsJury(request, hFake);

      // then
      expect(usecases.commentSessionAsJury).to.have.been.calledWithExactly({
        sessionId,
        juryCommentAuthorId: userId,
        juryComment: 'Un commentaire du pôle certif',
      });
    });
  });

  describe('#deleteJuryComment', function () {
    it('should delete the session comment', async function () {
      // given
      const sessionId = 1;
      sinon.stub(usecases, 'deleteSessionJuryComment');
      const request = { params: { id: sessionId } };

      // when
      const response = await juryCommentController.deleteJuryComment(request, hFake);

      // then
      expect(usecases.deleteSessionJuryComment).to.have.been.calledWithExactly({
        sessionId,
      });
      expect(response.statusCode).to.equal(204);
    });
  });
});
