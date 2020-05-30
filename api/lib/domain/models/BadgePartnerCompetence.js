class BadgePartnerCompetence {

  constructor({
    id,
    // attributes
    name,
    color,
    // includes
    // references
    skillIds,
    badgeId,
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.color = color;
    // includes
    // references
    this.skillIds = skillIds;
    this.badgeId = badgeId;
  }
}

module.exports = BadgePartnerCompetence;
