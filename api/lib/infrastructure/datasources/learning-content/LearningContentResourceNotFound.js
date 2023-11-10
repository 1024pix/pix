class LearningContentResourceNotFound extends Error {
  constructor({ skillId } = {}) {
    super();
    this.skillId = skillId;
  }
}

export { LearningContentResourceNotFound };
