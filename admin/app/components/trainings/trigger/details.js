import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class Details extends Component {
  @service store;

  get areasList() {
    return this.args.areas.map((area) => this.buildAreaViewModel(area));
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
      thematics: competence.thematics.map((thematic) => this.buildThematicViewModel(thematic)),
    };
  }

  buildThematicViewModel(thematic) {
    return {
      name: thematic.name,
      nbTubes: thematic.triggerTubes.length,
      tubes: thematic.triggerTubes.map((triggerTube) => {
        return this.buildTubeViewModel(triggerTube.get('tube'), triggerTube.level);
      }),
    };
  }

  buildTubeViewModel(tube, level) {
    return {
      id: tube.get('id'),
      title: `${tube.name} : ${tube.practicalTitle}`,
      level,
    };
  }
}
