class JuryComment {
  constructor({ commentByAutoJury, fallbackComment }) {
    this.commentByAutoJury = commentByAutoJury;
    this.fallbackComment = fallbackComment;
  }

  getFallbackComment() {
    return this.fallbackComment;
  }

  getKeyToTranslate() {
    return this.commentByAutoJury;
  }

  shouldTranslate() {
    return !!this.commentByAutoJury;
  }
}

export { JuryComment };
