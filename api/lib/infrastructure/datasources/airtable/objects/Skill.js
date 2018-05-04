class Skill {
  constructor({ id, name, hint, hintStatus }) {
    this.id = id;
    this.name = name;
    this.hint = hint;
    this.hintStatus = hintStatus;
  }

  static fromAirTableObject(airtableEpreuveObject) {
    return new Skill({
      id: airtableEpreuveObject['id'],
      name: airtableEpreuveObject['fields']['Nom'],
      hint: airtableEpreuveObject['fields']['Indice'],
      hintStatus: airtableEpreuveObject['fields']['Statut de l\'indice'],
    });
  }
}

module.exports = Skill;
