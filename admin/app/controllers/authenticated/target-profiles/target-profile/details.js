import Controller from '@ember/controller';

export default class TargetProfileDetailsController extends Controller {
  get areas() {
    return this.model.areas.sortBy('frameworkId', 'code').map((area) => this.buildAreaViewModel(area));
  }

  buildAreaViewModel(area) {
    return {
      title: `${area.code} · ${area.title}`,
      color: area.color,
      competences: area.competences.sortBy('index').map((competence) => this.buildCompetenceViewModel(competence)),
    };
  }

  buildCompetenceViewModel(competence) {
    return {
      id: competence.id,
      title: `${competence.index} ${competence.name}`,
      thematics: competence.thematics.sortBy('index').map((thematic) => this.buildThematicViewModel(thematic)),
    };
  }

  buildThematicViewModel(thematic) {
    return {
      name: thematic.name,
      nbTubes: thematic.tubes.length,
      tubes: thematic.tubes.sortBy('practicalTitle').map((tube) => this.buildTubeViewModel(tube)),
    };
  }

  buildTubeViewModel(tube) {
    return {
      id: tube.id,
      title: `${tube.name} : ${tube.practicalTitle}`,
      level: tube.level,
      mobile: tube.mobile,
      tablet: tube.tablet,
    };
  }
}
