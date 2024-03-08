import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CappedTubesCriterion extends Component {
  @tracked selectedTubeIds = [];
  @tracked tubeLevels = {};

  get areas() {
    return this.args.areas.sortBy('code');
  }

  @action
  checkTube(tube) {
    if (this.selectedTubeIds.includes(tube.id)) {
      return;
    }
    this.selectedTubeIds.pushObject(tube.id);

    this._triggerOnChange();
  }

  @action
  uncheckTube(tube) {
    const index = this.selectedTubeIds.indexOf(tube.id);
    if (index === -1) {
      return;
    }
    this.selectedTubeIds.removeAt(index);

    this._triggerOnChange();
  }

  @action
  setLevelTube(tubeId, level) {
    this.tubeLevels = {
      ...this.tubeLevels,
      [tubeId]: parseInt(level),
    };

    this._triggerOnChange();
  }

  _triggerOnChange() {
    const selectedTubesWithLevel = this._getSelectedTubesWithLevel();
    this.args.onTubesSelectionChange(selectedTubesWithLevel);
  }

  _getSelectedTubesWithLevel() {
    return this._selectedTubes.map((tube) => {
      const level = this.tubeLevels[tube.id] ?? tube.level;
      return { id: tube.id, level };
    });
  }

  get _selectedTubes() {
    return (
      this.args.areas
        .toArray()
        .flatMap((area) => {
          const competences = area.competences.toArray();
          return competences.flatMap((competence) => {
            const thematics = competence.thematics.toArray();
            return thematics.flatMap((thematic) => thematic.tubes.toArray());
          });
        })
        .filter((tube) => this.selectedTubeIds.includes(tube.id)) ?? []
    );
  }
}
