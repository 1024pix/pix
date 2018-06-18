class Competence {
  constructor({
    id,
    competenceCode,
    title,
    areaIds = [],
    courseIds = [],
    skillIds = [],
  } = {}) {
    this.id = id;
    this.competenceCode = competenceCode;
    this.title = title;
    this.areaIds = areaIds;
    this.courseIds = courseIds;
    this.skillIds = skillIds;
  }

  static fromAirTableObject(airtableCompetenceObject) {

    return new Competence({
      id: airtableCompetenceObject.getId(),
      competenceCode: airtableCompetenceObject.get('Sous-domaine'),
      title: airtableCompetenceObject.get('Titre'),
      areaIds: airtableCompetenceObject.get('Domaine'),
      courseIds: airtableCompetenceObject.get('Epreuves'),
      skillIds: airtableCompetenceObject.get('Acquis (identifiants)'),
    });
  }
}

module.exports = Competence;
