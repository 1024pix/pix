import { assertEnumValue } from '../../../../shared/domain/models/asserts.js';

/**
 * @typedef {string} JuryCommentContext
 * @readonly
 * @enum {JuryCommentContext}
 */
const JuryCommentContexts = Object.freeze({
  CANDIDATE: 'candidate',
  ORGANIZATION: 'organization',
});

/**
 * @typedef {string} AutoJuryCommentKey
 * @readonly
 * @enum {AutoJuryCommentKey}
 */
const AutoJuryCommentKeys = Object.freeze({
  FRAUD: 'FRAUD',
  CANCELLED_DUE_TO_NEUTRALIZATION: 'CANCELLED_DUE_TO_NEUTRALIZATION',
  REJECTED_DUE_TO_LACK_OF_ANSWERS: 'REJECTED_DUE_TO_LACK_OF_ANSWERS',
});

class JuryComment {
  /**
   * @param {Object} props
   * @param {AutoJuryCommentKey} [props.commentByAutoJury]
   * @param {string} [props.fallbackComment]
   * @param {JuryCommentContext} props.context mandatory if AutoJuryCommentKeys given
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

export { AutoJuryCommentKeys, JuryComment, JuryCommentContexts };
