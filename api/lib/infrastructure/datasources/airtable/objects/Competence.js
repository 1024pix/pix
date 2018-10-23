class Competence {
  constructor({
    id,
    name,
    index,
    courseId,
    skillIds = [],
    areaId
  } = {}) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.courseId = courseId;
    this.skillIds = skillIds;
    this.areaId = areaId;
  }

  static fromAirTableObject(rawAirtableCompetence) {

    return new Competence({
      id: rawAirtableCompetence.getId(),
      name: rawAirtableCompetence.get('Titre'),
      index: rawAirtableCompetence.get('Sous-domaine'),
      areaId: rawAirtableCompetence.get('Domaine') ? rawAirtableCompetence.get('Domaine')[0] : '',
      courseId: rawAirtableCompetence.get('Tests') ? rawAirtableCompetence.get('Tests')[0] : '',
      skillIds: rawAirtableCompetence.get('Acquis (via Tubes)'),
    });
  }
}

module.exports = Competence;
