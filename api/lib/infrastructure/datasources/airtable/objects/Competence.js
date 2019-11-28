class Competence {
  constructor({
    id,
    name,
    index,
    description,
    courseId,
    skillIds = [],
    areaId
  } = {}) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.description = description,
    this.courseId = courseId;
    this.skillIds = skillIds;
    this.areaId = areaId;
  }
}

module.exports = Competence;
