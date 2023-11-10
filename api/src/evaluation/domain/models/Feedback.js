export class Feedback {
  constructor({ id, content, assessmentId, challengeId, createdAt, updatedAt, category, answer, userAgent } = {}) {
    this.id = id;
    this.content = content;
    this.category = category;
    this.answer = answer;
    this.assessmentId = assessmentId;
    this.challengeId = challengeId;
    this.userAgent = userAgent;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
