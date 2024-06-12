import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Details extends Component {
  @service store;

  @tracked areas = [];

  constructor() {
    super(...arguments);
    Promise.resolve(this.args.areas).then((areas) => {
      this.areas = areas;
    });
  }

  get areasList() {
    return this.areas.sortBy('code').map((area) => this.buildAreaViewModel(area));
  }

  buildAreaViewModel(area) {
    return {
      title: `${area.code} · ${area.title}`,
      color: area.color,
      competences: area.sortedCompetences.map((competence) => this.buildCompetenceViewModel(competence)),
    };
  }

  buildCompetenceViewModel(competence) {
    return {
      id: competence.id,
      title: `${competence.index} ${competence.name}`,
      thematics: competence
        .hasMany('thematics')
        .value()
        .map((thematic) => this.buildThematicViewModel(thematic)),
    };
  }

  buildThematicViewModel(thematic) {
    return {
      name: thematic.name,
      nbTubes: thematic.hasMany('triggerTubes').value().length,
      tubes: thematic
        .hasMany('triggerTubes')
        .value()
        .map((triggerTube) => {
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
