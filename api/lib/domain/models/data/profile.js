class Profile {
  constructor(user, competences, areas) {
    this.user = user;
    this.competences = competences;
    this.areas = areas;
    this.setLevelToCompetences();
  }

  setLevelToCompetences() {
    if(this.competences) {
      this.competences.forEach((competence) => competence['level'] = -1);
    }
  }
}

module.exports = Profile;
