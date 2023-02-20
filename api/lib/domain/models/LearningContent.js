export default class LearningContent {
  constructor(frameworks) {
    this.frameworks = frameworks;
  }

  get areas() {
    return this.frameworks.flatMap((framework) => framework.areas);
  }

  get competences() {
    return this.areas.flatMap((area) => area.competences);
  }

  get thematics() {
    return this.competences.flatMap((competence) => competence.thematics);
  }

  // TODO faire sortir les tubes depuis les thématiques
  get tubes() {
    return this.competences.flatMap((competences) => competences.tubes);
  }

  get skills() {
    return this.tubes.flatMap((tube) => tube.skills);
  }

  findSkill(skillId) {
    return this.skills.find((skill) => skill.id === skillId) ?? null;
  }

  findTube(tubeId) {
    return this.tubes.find((tube) => tube.id === tubeId) ?? null;
  }

  findCompetence(competenceId) {
    return this.competences.find((competence) => competence.id === competenceId) ?? null;
  }

  findArea(areaId) {
    return this.areas.find((area) => area.id === areaId) ?? null;
  }

  findFramework(frameworkId) {
    return this.frameworks.find((framework) => framework.id === frameworkId) ?? null;
  }

  findCompetenceIdOfSkill(skillId) {
    const tubeId = this.findSkill(skillId)?.tubeId;
    if (!tubeId) return null;
    return this.findTube(tubeId).competenceId;
  }

  findFrameworkNameOfArea(areaId) {
    const frameworkId = this.findArea(areaId)?.frameworkId;
    if (!frameworkId) return '';
    return this.findFramework(frameworkId).name;
  }
}
