class Course {

  constructor(model = {}) {
    // properties
    this.id = model.id;
    this.name = model.name;
    this.description = model.description;
    this.imageUrl = model.imageUrl;
    this.isAdaptive = model.isAdaptive;

    // relationships
    this.competence = model.competence;
    this.challenges = model.challenges || [];
  }
}

module.exports = Course;
