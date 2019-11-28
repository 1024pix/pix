class Course {
  constructor({
    id,
    name,
    description,
    adaptive,
    imageUrl,
    competences,
    challenges,
  } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.adaptive = adaptive;
    this.imageUrl = imageUrl;
    this.competences = competences;
    this.challenges = challenges;
  }

}

module.exports = Course;
