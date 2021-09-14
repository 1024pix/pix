class SessionJuryComment {
  constructor({
    id,
    comment,
    authorId,
    updatedAt,
  }) {
    this.id = id;
    this.comment = comment;
    this.authorId = authorId;
    this.updatedAt = updatedAt;
  }
}

module.exports = SessionJuryComment;
