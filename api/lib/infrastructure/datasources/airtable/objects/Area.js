class Area {
  constructor({
    id,
    code,
    name,
    title,
    competenceIds,
  } = {}) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.title = title;
    this.competenceIds = competenceIds;
  }

  static getAirtableName() {
    return 'Domaines';
  }

  static getUsedAirtableFields() {
    return [
      'Code',
      'Nom',
      'Titre',
      'Competences (identifiants)',
    ];
  }

  static fromAirTableObject(airtableDomaineObject) {
    return new Area({
      id: airtableDomaineObject.getId(),
      code: airtableDomaineObject.get('Code'),
      name: airtableDomaineObject.get('Nom'),
      title: airtableDomaineObject.get('Titre'),
      competenceIds: airtableDomaineObject.get('Competences (identifiants)'),
    });
  }
}

module.exports = Area;
