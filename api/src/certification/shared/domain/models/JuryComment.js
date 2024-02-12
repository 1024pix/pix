const JuryCommentContexts = Object.freeze({
  CANDIDATE: 'candidate',
  ORGANIZATION: 'organization',
});

const AutoJuryCommentKeys = Object.freeze({
  FRAUD: 'FRAUD',
});

const MAPPING_JURY_AUTO_COMMENT_KEYS_TO_TRANSLATION_KEYS = {
  FRAUD: 'jury.comment.fraud',
};

class JuryComment {
  constructor({ commentByAutoJury, fallbackComment, context }) {
    this.commentByAutoJury = AutoJuryCommentKeys[commentByAutoJury];
    this.fallbackComment = fallbackComment;
    this.context = context;
  }

  getFallbackComment() {
    return this.fallbackComment;
  }

  getKeyToTranslate() {
    return `${MAPPING_JURY_AUTO_COMMENT_KEYS_TO_TRANSLATION_KEYS[this.commentByAutoJury]}.${this.context}`;
  }

  shouldBeTranslated() {
    return !!this.commentByAutoJury;
  }
}

export { JuryComment, JuryCommentContexts, AutoJuryCommentKeys };
