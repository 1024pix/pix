class TargetProfile {
  constructor({
    // attributes
    name,
    isPublic,
    // includes
    skills = []
    // references
  } = {}) {
    // attributes
    this.name = name;
    this.isPublic = isPublic;
    // includes
    this.skills = skills;
    // references
  }
}

module.exports = TargetProfile;
