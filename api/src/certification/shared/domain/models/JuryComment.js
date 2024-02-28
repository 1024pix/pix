import { assertEnumValue } from '../../../../shared/domain/models/asserts.js';

/**
 * @readonly
 * @enum {string}
 */
const JuryCommentContexts = Object.freeze({
  CANDIDATE: 'candidate',
  ORGANIZATION: 'organization',
});

/**
 * @readonly
 * @enum {string}
 */
const AutoJuryCommentKeys = Object.freeze({
  FRAUD: 'FRAUD',
  CANCELLED_DUE_TO_NEUTRALIZATION: 'CANCELLED_DUE_TO_NEUTRALIZATION',
});

class JuryComment {
  /**
   * @param {Object} props
   * @param {AutoJuryCommentKeys} props.commentByAutoJury
   * @param {string} props.fallbackComment
   * @param {JuryCommentContexts} props.context mandatory if AutoJuryCommentKeys given
   */
  constructor({ commentByAutoJury, fallbackComment, context }) {
    this.commentByAutoJury = AutoJuryCommentKeys[commentByAutoJury];

    if (this.commentByAutoJury) {
      assertEnumValue(JuryCommentContexts, context);
      this.context = context;
    }

    this.fallbackComment = fallbackComment;
  }

  getComment(translate) {
    return this.#shouldBeTranslated() ? translate(this.#getKeyToTranslate()) : this.fallbackComment;
  }

  clone() {
    return new JuryComment({
      commentByAutoJury: this.commentByAutoJury,
      fallbackComment: this.fallbackComment,
      context: this.context,
    });
  }

  #getKeyToTranslate() {
    return `jury.comment.${this.commentByAutoJury}.${this.context}`;
  }

  #shouldBeTranslated() {
    return !!this.commentByAutoJury;
  }
}

export { JuryComment, JuryCommentContexts, AutoJuryCommentKeys };
