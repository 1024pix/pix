class BadgePartnerCompetence {

  constructor({
    id,
    name,
    color,
    skillIds,
  } = {}) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.skillIds = skillIds;
  }
}

module.exports = BadgePartnerCompetence;
