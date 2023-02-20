class SessionJuryComment {
  constructor({ id, comment, authorId, updatedAt }) {
    this.id = id;
    this.comment = comment;
    this.authorId = authorId;
    this.updatedAt = updatedAt;
  }

  update({ comment, authorId }) {
    this.comment = comment;
    this.authorId = authorId;
    this.updatedAt = new Date();
  }
}

export default SessionJuryComment;
