class UserSavedTutorial {
  constructor({ id, userId, tutorialId } = {}) {
    this.id = id;
    this.userId = userId;
    this.tutorialId = tutorialId;
  }
}

module.exports = UserSavedTutorial;
