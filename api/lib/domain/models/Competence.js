class Competence {

  constructor({
    id,
    // attributes
    area,
    name,
    index,
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
