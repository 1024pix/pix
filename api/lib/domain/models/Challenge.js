class Challenge {

  constructor({
    id,
    type,
    instruction,
    competence,
    proposals,
    timer,
    illustrationUrl,
    attachments,
    answer,
    skills = [],
    embedUrl,
    embedTitle,
    embedHeight,
  } = {}) {
    this.skills = skills;
    this.id = id;
    this.type = type;
    this.instruction = instruction;
    this.competence = competence;
    this.proposals = proposals;
    this.timer = timer;
    this.illustrationUrl = illustrationUrl;
    this.attachments = attachments;
    this.answer = answer;
    this.embedUrl = embedUrl;
    this.embedTitle = embedTitle;
    this.embedHeight = embedHeight;
  }

  addSkill(skill) {
    this.skills.push(skill);
  }

  hasSkill(searchedSkill) {
    return this.skills.filter((skill) => skill.name === searchedSkill.name).length > 0;
  }

  isPublished() {
    return ['validé', 'validé sans test', 'pré-validé'].includes(this.status);
  }

}

module.exports = Challenge;
