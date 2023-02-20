class Course {
  constructor({ id, description, imageUrl, name, challenges = [], competences = [] } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.challenges = challenges; // Array of Record IDs
    this.competences = competences; // Array of Record IDs
  }

  get nbChallenges() {
    return this.challenges.length;
  }
}

export default Course;
