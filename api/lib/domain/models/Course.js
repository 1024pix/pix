class Course {

  constructor({
    id,
    // attributes
    description,
    imageUrl,
    name,
    type,
    // includes
    // references
    challenges = [],
    competences = [],
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.type = type;
    // includes
    // references
    this.challenges = challenges; // Array of Record IDs
    this.competences = competences; // Array of Record IDs
  }

  get nbChallenges() {
    return this.challenges.length;
  }
}

module.exports = Course;
