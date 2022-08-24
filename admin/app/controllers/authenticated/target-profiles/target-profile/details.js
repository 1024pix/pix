import Controller from '@ember/controller';

export default class TargetProfileDetailsController extends Controller {
  get areas() {
    return this.model.newAreas.map((area) => this.buildAreaViewModel(area)).sortBy('code');
  }

  buildAreaViewModel(area) {
    return {
      title: `${area.code} · ${area.title}`,
      color: area.color,
      competences: area.competences.map((competence) => this.buildCompetenceViewModel(competence)).sortBy('index'),
    };
  }

  buildCompetenceViewModel(competence) {
    return {
      title: `${competence.index} ${competence.name}`,
      thematics: competence.thematics.map((thematic) => this.buildThematicViewModel(thematic)).sortBy('index'),
    };
  }

  buildThematicViewModel(thematic) {
    return {
      name: thematic.name,
      nbTubes: thematic.tubes.length,
      tubes: thematic.tubes.map((tube) => this.buildTubeViewModel(tube)).sortBy('practicalTitle'),
    };
  }

  buildTubeViewModel(tube) {
    return {
      title: `${tube.name} : ${tube.practicalTitle}`,
      level: tube.level,
      mobile: tube.mobile,
      tablet: tube.tablet,
    };
  }
}
