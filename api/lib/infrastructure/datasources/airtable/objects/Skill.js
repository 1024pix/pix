class Skill {
  constructor({ id, name, hint, hintStatus = 'no status', tutorialIds = [] } = {}) {
    this.id = id;
    this.name = name;
    this.hint = hint;
    this.hintStatus = hintStatus;
    this.tutorialIds = tutorialIds;
  }

  static fromAirTableObject(airtableSkillObject) {
    return new Skill({
      id: airtableSkillObject.getId(),
      name: airtableSkillObject.get('Nom'),
      hint: airtableSkillObject.get('Indice'),
      hintStatus: airtableSkillObject.get('Statut de l\'indice'),
      tutorialIds: airtableSkillObject.get('Comprendre'),
    });
  }
}

module.exports = Skill;
