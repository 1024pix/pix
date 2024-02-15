const JuryCommentContexts = Object.freeze({
  CANDIDATE: 'candidate',
  ORGANIZATION: 'organization',
});

const AutoJuryCommentKeys = Object.freeze({
  FRAUD: 'FRAUD',
  CANCELLED_DUE_TO_NEUTRALIZATION: 'CANCELLED_DUE_TO_NEUTRALIZATION',
});

const MAPPING_JURY_AUTO_COMMENT_KEYS_TO_TRANSLATION_KEYS = {
  FRAUD: 'jury.comment.fraud',
  CANCELLED_DUE_TO_NEUTRALIZATION: 'jury.comment.cancelled_due_to_neutralization',
};

class JuryComment {
  constructor({ commentByAutoJury, fallbackComment, context }) {
    this.commentByAutoJury = AutoJuryCommentKeys[commentByAutoJury];
    this.fallbackComment = fallbackComment;
    this.context = context;
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
