class Skill {
  constructor({ id, name, hint, hintStatus, tutorialId } = {}) {
    this.id = id;
    this.name = name;
    this.hint = hint;
    this.hintStatus = hintStatus;
    this.tutorialId = tutorialId;
  }

  static fromAirTableObject(airtableEpreuveObject) {
    return new Skill({
      id: airtableEpreuveObject['id'],
      name: airtableEpreuveObject['fields']['Nom'],
      hint: airtableEpreuveObject['fields']['Indice'],
      hintStatus: airtableEpreuveObject['fields']['Statut de l\'indice'],
      tutorialId: airtableEpreuveObject['fields']['Comprendre'],
    });
  }
}

module.exports = Skill;
