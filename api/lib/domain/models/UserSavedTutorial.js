class UserSavedTutorial {
  constructor({ id, userId, tutorialId, skillId, createdAt } = {}) {
    this.id = id;
    this.userId = userId;
    this.tutorialId = tutorialId;
    this.skillId = skillId;
    this.createdAt = createdAt;
  }
}

export default UserSavedTutorial;
