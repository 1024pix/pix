class BadgePartnerCompetenceViewModel {

  constructor({
    id,
    // attributes
    name,
    color,
    // includes
    // references
    skillIds
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.color = color;
    // includes
    // references
    this.skillIds = skillIds;
  }
}

module.exports = BadgePartnerCompetenceViewModel;
