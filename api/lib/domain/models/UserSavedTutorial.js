class UserSavedTutorial {
  constructor({ id, userId, tutorialId, skillId } = {}) {
    this.id = id;
    this.userId = userId;
    this.tutorialId = tutorialId;
    this.skillId = skillId;
  }
}

module.exports = UserSavedTutorial;
