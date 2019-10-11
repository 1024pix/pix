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

  static getAirtableName() {
    return 'Competences';
  }

  static getUsedAirtableFields() {
    return [
      'Titre',
      'Sous-domaine',
      'Description',
      'Domaine',
      'Tests',
      'Acquis (via Tubes)'
    ];
  }

  static fromAirTableObject(rawAirtableCompetence) {

    return new Competence({
      id: rawAirtableCompetence.getId(),
      name: rawAirtableCompetence.get('Titre'),
      index: rawAirtableCompetence.get('Sous-domaine'),
      description: rawAirtableCompetence.get('Description'),
      areaId: rawAirtableCompetence.get('Domaine') ? rawAirtableCompetence.get('Domaine')[0] : '',
      courseId: rawAirtableCompetence.get('Tests') ? rawAirtableCompetence.get('Tests')[0] : '',
      skillIds: rawAirtableCompetence.get('Acquis (via Tubes)'),
    });
  }
}

module.exports = Competence;
