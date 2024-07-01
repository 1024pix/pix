import {
  AutoJuryCommentKeys,
  JuryComment,
  JuryCommentContexts,
} from '../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { expect } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

describe('Unit | Domain | Models | JuryComment', function () {
  let translate;

  beforeEach(function () {
    translate = getI18n().__;
  });

  describe('should create a jury comment', function () {
    context('when context is INTERNAL_NOTE', function () {
      it('should create an internal jury comment', function () {
        // when
        const juryComment = new JuryComment({
          context: 'INTERNAL_NOTE',
          fallbackComment: 'le candidat est génial',
        });

        const internalComment = juryComment.getComment();

        // then
        expect(internalComment).to.equal('le candidat est génial');
      });
    });
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
        // given
        const juryComment = new JuryComment({
          fallbackComment: 'Le petit Max a copié la réponse sur Lily!!',
          commentByAutoJury: AutoJuryCommentKeys.FRAUD,
          context: JuryCommentContexts.CANDIDATE,
        });

        // when
        const translatedComment = juryComment.getComment(translate);

        // then
        expect(translatedComment).to.equal(translate('jury.comment.FRAUD.candidate'));
      });
    });

    it('should return the fallback comment', function () {
      // given
      const juryComment = new JuryComment({
        fallbackComment: 'Belle perf!',
        context: JuryCommentContexts.CANDIDATE,
      });

      // when
      const translatedComment = juryComment.getComment(translate);

      // then
      expect(translatedComment).to.equal('Belle perf!');
    });
  });
});
