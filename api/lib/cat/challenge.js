class Challenge {
  constructor(id, status, skills, timer) {
    this.id = id;
    this.status = status;
    this.skills = skills;
    this.timer = timer;
  }

  get hardestSkill() {
    return this.skills.reduce((s1, s2) => (s1.difficulty > s2.difficulty) ? s1 : s2);
  }
}

module.exports = Challenge;
