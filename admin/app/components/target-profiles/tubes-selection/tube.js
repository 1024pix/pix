import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isTubeSelected } from '../../../helpers/is-tube-selected';

export default class Tube extends Component {
  get levelOptions() {
    return Array.from({ length: this._maxLevel }, (_, index) => ({
      value: index + 1,
      label: `${index + 1}`,
    }));
  }

  get _maxLevel() {
    return this.args.tube.level ?? 8;
  }

  get state() {
    return isTubeSelected(this.args.selectedTubeIds, this.args.tube) ? 'checked' : 'unchecked';
  }

  get selectedLevel() {
    return this.args.tubeLevels[this.args.tube.id] ?? this._maxLevel;
  }

  get checked() {
    return this.state === 'checked';
  }

  @action
  onChange(event) {
    if (event.target.checked) {
      this.args.checkTube(this.args.tube);
    } else {
      this.args.uncheckTube(this.args.tube);
    }
  }

  @action
  setLevelTube(level) {
    const tubeId = this.args.tube.id;
    this.args.setLevelTube(tubeId, level);
  }
}
