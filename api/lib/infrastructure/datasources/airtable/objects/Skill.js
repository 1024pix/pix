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
}

module.exports = Skill;
