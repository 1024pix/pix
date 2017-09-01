class Challenge {
  constructor(id, status, skills) {
    this.id = id;
    this.status = status;
    this.skills = skills;
  }

  get hardestSkill() {
    return this.skills.reduce((s1, s2) => (s1.difficulty > s2.difficulty) ? s1 : s2);
  }
}

module.exports = Challenge;
