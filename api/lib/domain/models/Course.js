class Course {
  constructor({ id, description, isActive, imageUrl, name, challenges = [], competences = [] } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.isActive = isActive;
    this.imageUrl = imageUrl;
    this.challenges = challenges; // Array of Record IDs
    this.competences = competences; // Array of Record IDs
  }

  get nbChallenges() {
    return this.challenges.length;
  }

  get canBePlayed() {
    return this.isActive;
  }
}

export { Course };
