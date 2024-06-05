import Controller from '@ember/controller';

export default class TargetProfileDetailsController extends Controller {
  get areas() {
    return this.model.areas.sortBy('frameworkId', 'code').map((area) => this.buildAreaViewModel(area));
  }

  buildAreaViewModel(area) {
    return {
      title: `${area.code} · ${area.title}`,
      color: area.color,
      competences: area
        .hasMany('competences')
        .value()
        .sortBy('index')
        .map((competence) => this.buildCompetenceViewModel(competence)),
    };
  }

  buildCompetenceViewModel(competence) {
    return {
      id: competence.id,
      title: `${competence.index} ${competence.name}`,
      thematics: competence
        .hasMany('thematics')
        .value()
        .sortBy('index')
        .map((thematic) => this.buildThematicViewModel(thematic)),
    };
  }

  buildThematicViewModel(thematic) {
    return {
      name: thematic.name,
      nbTubes: thematic.hasMany('tubes').value().length,
      tubes: thematic
        .hasMany('tubes')
        .value()
        .sortBy('practicalTitle')
        .map((tube) => this.buildTubeViewModel(tube)),
    };
  }

  buildTubeViewModel(tube) {
    return {
      id: tube.id,
      title: `${tube.name} : ${tube.practicalTitle}`,
      level: tube.level,
      mobile: tube.mobile,
      tablet: tube.tablet,
      skills: tube
        .hasMany('skills')
        .value()
        .sortBy('difficulty')
        .map((skill) => this.buildSkillViewModel(skill)),
    };
  }

  buildSkillViewModel(skill) {
    return {
      id: skill.id,
      difficulty: skill.difficulty,
    };
  }
}
