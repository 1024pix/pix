class Skill {
  constructor({
    id,
    name,
    hint,
    hintStatus = 'no status',
    tutorialIds = [],
    learningMoreTutorialIds = [],
    pixValue,
    competenceId,
  } = {}) {
    this.id = id;
    this.name = name;
    this.hint = hint;
    this.hintStatus = hintStatus;
    this.tutorialIds = tutorialIds;
    this.learningMoreTutorialIds = learningMoreTutorialIds;
    this.pixValue = pixValue;
    this.competenceId = competenceId;
  }

  static fromAirTableObject(airtableSkillObject) {
    return new Skill({
      id: airtableSkillObject.getId(),
      name: airtableSkillObject.get('Nom'),
      hint: airtableSkillObject.get('Indice'),
      hintStatus: airtableSkillObject.get('Statut de l\'indice'),
      tutorialIds: airtableSkillObject.get('Comprendre'),
      learningMoreTutorialIds: airtableSkillObject.get('En savoir plus'),
      pixValue: airtableSkillObject.get('PixValue'),
      competenceId: airtableSkillObject.get('Compétence (via Tube)')[0],
    });
  }
}

module.exports = Skill;
