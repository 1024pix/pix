const STATUSES = {
  NOT_ASSESSED: 'notAssessed',
  ASSESSMENT_NOT_COMPLETED: 'assessmentNotCompleted',
  ASSESSED: 'assessed',
  UNKNOWN: 'unknown',
};

class Competence {

  constructor({
    id,
    // attributes
    area,
    name,
    index,
    description,
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
    this.level = -1;
    this.status = STATUSES.NOT_ASSESSED;
    // includes
    this.skills = skills; // TODO remplacer par un vrai tableau de SKills
    // references
    this.courseId = courseId; // TODO remplacer par un vrai Course
  }

  get reference() {
    return `${this.index} ${this.name}`;
  }

}

Competence.STATUSES = STATUSES;

module.exports = Competence;
