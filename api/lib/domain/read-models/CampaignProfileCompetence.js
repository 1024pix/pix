class CampaignProfileCompetence {
  constructor({
    id,
    index,
    name,
    pixScore,
    estimatedLevel,
    area
  } = {}) {
    this.id = id;
    this.index = index;
    this.name = name;
    this.pixScore = pixScore;
    this.estimatedLevel = estimatedLevel;
    this.areaColor = area && area.color;
  }
}

module.exports = CampaignProfileCompetence;
