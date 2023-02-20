class SkillSet {
  constructor({ id, name, skillIds, badgeId } = {}) {
    this.id = id;
    this.name = name;
    this.skillIds = skillIds;
    this.badgeId = badgeId;
  }
}

export default SkillSet;
