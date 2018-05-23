class Competence {

  constructor({ id, name, index, courseId, skills = [], area } = {}) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.courseId = courseId; // TODO remplacer par un vrai Course
    this.skills = skills; // TODO remplacer par un vrai tableau de SKills
    this.area = area;
  }

  get reference() {
    return `${this.index} ${this.name}`;
  }

}

module.exports = Competence;
