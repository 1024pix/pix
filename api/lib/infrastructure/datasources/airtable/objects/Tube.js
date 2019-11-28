class Tube {
  constructor({
    id,
    name,
    title,
    description,
    practicalTitle,
    practicalDescription,
  } = {}) {
    this.id = id;
    this.name = name;
    this.title = title;
    this.description = description;
    this.practicalTitle = practicalTitle;
    this.practicalDescription = practicalDescription;
  }

  static getUsedAirtableFields() {
    return [
      'Nom',
      'Titre',
      'Description',
      'Titre pratique',
      'Description pratique',
    ];
  }

  static fromAirTableObject(airtableSkillObject) {
    return new Tube({
      id: airtableSkillObject.getId(),
      name: airtableSkillObject.get('Nom'),
      title: airtableSkillObject.get('Titre'),
      description: airtableSkillObject.get('Description'),
      practicalTitle: airtableSkillObject.get('Titre pratique'),
      practicalDescription: airtableSkillObject.get('Description pratique'),
    });
  }
}

module.exports = Tube;
