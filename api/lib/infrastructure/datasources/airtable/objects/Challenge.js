class Challenge {
  constructor({
    id,
    instruction,
    proposals,
    type,
    solution,
    t1Status,
    t2Status,
    t3Status,
    scoring,
    status,
    skillIds = [],
    skills = [],
    timer,
    illustrationUrl,
    attachments,
    competenceId,
    embedUrl,
    embedTitle,
    embedHeight,
    illustrationAlt,
  } = {}) {
    this.id = id;
    this.instruction = instruction;
    this.proposals = proposals;
    this.type = type;
    this.solution = solution;
    this.t1Status = t1Status;
    this.t2Status = t2Status;
    this.t3Status = t3Status;
    this.scoring = scoring;
    this.status = status;
    this.skillIds = skillIds;
    this.skills = skills;
    this.timer = timer;
    this.illustrationUrl = illustrationUrl;
    this.attachments = attachments;
    this.competenceId = competenceId;
    this.embedUrl = embedUrl;
    this.embedTitle = embedTitle;
    this.embedHeight = embedHeight;
    this.illustrationAlt = illustrationAlt;
  }
}

module.exports = Challenge;
