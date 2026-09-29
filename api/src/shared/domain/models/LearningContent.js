import _ from 'lodash';

class LearningContent {
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

  get skillNames() {
    return this.skills.map((skill) => skill.name);
  }

  get tubeIds() {
    return this.tubes.map((tube) => tube.id);
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

  findAreaOfCompetence(competence) {
    const area = this.findArea(competence.areaId);
    return area || null;
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
  /**
   * Compte, par compétence du contenu ciblé, les acquis de la liste qui en
   * font partie. Les acquis hors du contenu ciblé sont ignorés.
   *
   * @param {string[]} skillIds
   * @returns {Object.<string, number>}
   */
  countTargetedSkillsByCompetence(skillIds) {
    const countByCompetence = {};
    for (const competence of this.competences) {
      countByCompetence[competence.id] = 0;
    }
    for (const skillId of skillIds) {
      const competenceId = this.findCompetenceIdOfSkill(skillId);
      if (competenceId) {
        countByCompetence[competenceId] += 1;
      }
    }

    return countByCompetence;
  }

  get maxSkillDifficulty() {
    const skillMaxDifficulty = _.maxBy(this.skills, 'difficulty');
    return skillMaxDifficulty ? skillMaxDifficulty.difficulty : null;
  }
}

export { LearningContent };
