import Controller from '@ember/controller';

export default class TargetProfileDetailsController extends Controller {
  get tubesSelectionAreas() {
    return this.model.tubesSelectionAreas.map((area) => ({
      title: `${area.code} · ${area.title}`,
      color: area.color,
      competences: area.competences.map((area) => this.buildCompetenceViewModel(area)),
    }));
  }

  buildCompetenceViewModel(competence) {
    return {
      title: `${competence.index} ${competence.name}`,
      thematics: competence.thematics.map((thematic) => this.buildThematicViewModel(thematic)),
    };
  }

  buildThematicViewModel(thematic) {
    return {
      name: thematic.name,
      nbTubes: thematic.tubes.length,
      tubes: thematic.tubes.map((tube) => this.buildTubeViewModel(tube)),
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
