import Component from '@glimmer/component';

export default class CappedTubesCriterion extends Component {
  get areasForView() {
    return this.args.targetProfile.areas
      .sortBy('code')
      .map((area) => ({
        area,
        competences: this._buildCompetencesViewModel(area.competences),
      }))
      .filter(({ competences }) => competences.length !== 0)
      .map(({ area, competences }) => ({
        title: `${area.code} · ${area.title}`,
        color: area.color,
        competences,
      }));
  }

  _buildCompetencesViewModel(competences) {
    return competences
      .sortBy('index')
      .map((competence) => ({
        competence,
        thematics: this._buildThematicsViewModel(competence.thematics),
      }))
      .filter(({ thematics }) => thematics.length !== 0)
      .map(({ competence, thematics }) => ({
        title: `${competence.index} ${competence.name}`,
        thematics,
      }));
  }

  _buildThematicsViewModel(thematics) {
    return thematics
      .sortBy('index')
      .map((thematic) => ({
        thematic,
        tubes: this._buildTubesViewModel(thematic.tubes),
      }))
      .filter(({ tubes }) => tubes.length !== 0)
      .map(({ thematic, tubes }) => ({
        name: thematic.name,
        nbTubes: tubes.length,
        tubes,
      }));
  }

  _buildTubesViewModel(tubes) {
    return tubes
      .sortBy('practicalName')
      .map((tube) => ({
        tube,
        cappedTube: this.args.criterion.cappedTubes.find(({ tubeId }) => tubeId === tube.id),
      }))
      .filter(({ cappedTube }) => cappedTube)
      .map(({ tube, cappedTube }) => ({
        id: tube.id,
        title: `${tube.name} : ${tube.practicalTitle}`,
        level: cappedTube.level,
        tablet: tube.tablet,
        mobile: tube.mobile,
      }));
  }
}
