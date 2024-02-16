import {
  JuryComment,
  AutoJuryCommentKeys,
  JuryCommentContexts,
} from '../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { expect } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

describe('Unit | Domain | Models | JuryComment', function () {
  let translate;

  beforeEach(function () {
    translate = getI18n().__;
  });

  describe('#getComment', function () {
    context('when there is an automatic jury comment', function () {
      it('expects a context', function () {
        // given
        const juryCommentBadParameters = {
          fallbackComment: 'Le petit Max a copié la réponse sur Lily!!',
          commentByAutoJury: AutoJuryCommentKeys.FRAUD,
          context: 'NOT A VALID CONTEXT',
        };

        // when, then
        expect(() => new JuryComment(juryCommentBadParameters)).to.throw();
      });

      it('should return the translated comment matching the key', function () {
        // Given
        const juryComment = new JuryComment({
          fallbackComment: 'Le petit Max a copié la réponse sur Lily!!',
          commentByAutoJury: AutoJuryCommentKeys.FRAUD,
          context: JuryCommentContexts.CANDIDATE,
        });

        // When & Then
        expect(juryComment.getComment(translate)).to.equal(translate('jury.comment.fraud.candidate'));
      });
    });

    it('should return the fallback comment', function () {
      // Given
      const juryComment = new JuryComment({
        fallbackComment: 'Belle perf!',
        context: JuryCommentContexts.CANDIDATE,
      });
      // When & Then
      expect(juryComment.getComment(translate)).to.equal('Belle perf!');
    });
  });
});
