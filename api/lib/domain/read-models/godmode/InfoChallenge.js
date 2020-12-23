class InfoChallenge {
  constructor({
    id,
    type,
    solution,
    pixValue,
    skillIds,
    skillNames,
    tubeIds,
    tubeNames,
    competenceIds,
    competenceNames,
    areaIds,
    areaNames,
  } = {}) {
    this.id = id;
    this.type = type;
    this.solution = solution;
    this.pixValue = pixValue;
    this.skillIds = skillIds;
    this.skillNames = skillNames;
    this.tubeIds = tubeIds;
    this.tubeNames = tubeNames;
    this.competenceIds = competenceIds;
    this.competenceNames = competenceNames;
    this.areaIds = areaIds;
    this.areaNames = areaNames;
  }
}

module.exports = InfoChallenge;
