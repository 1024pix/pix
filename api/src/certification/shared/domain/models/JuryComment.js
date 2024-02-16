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

const MAPPING_JURY_AUTO_COMMENT_KEYS_TO_TRANSLATION_KEYS = {
  FRAUD: 'jury.comment.fraud',
  CANCELLED_DUE_TO_NEUTRALIZATION: 'jury.comment.cancelled_due_to_neutralization',
};

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

  #getKeyToTranslate() {
    return `${MAPPING_JURY_AUTO_COMMENT_KEYS_TO_TRANSLATION_KEYS[this.commentByAutoJury]}.${this.context}`;
  }

  #shouldBeTranslated() {
    return !!this.commentByAutoJury;
  }
}

export { JuryComment, JuryCommentContexts, AutoJuryCommentKeys };
