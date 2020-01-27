class Competence {

  constructor({
    id,
    // attributes
    area,
    name,
    index,
    description,
    origin,
    // includes
    skills = [],
    // references
    courseId,
  } = {}) {
    this.id = id;
    // attributes
    this.area = area;
    this.name = name;
    this.index = index;
    this.description = description;
    this.origin = origin;
    this.level = -1;
    // includes
    this.skills = skills; // TODO remplacer par un vrai tableau de SKills
    // references
    this.courseId = courseId; // TODO remplacer par un vrai Course
  }

  get reference() {
    return `${this.index} ${this.name}`;
  }

}

module.exports = Competence;
