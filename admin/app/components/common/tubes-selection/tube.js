import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isTubeSelected } from '../../../helpers/is-tube-selected';
import { tracked } from '@glimmer/tracking';

const MAX_TUBE_LEVEL = 8;

export default class Tube extends Component {
  @tracked skillAvailabilityMap = [];

  constructor(...args) {
    super(...args);
    if (this.args.displaySkillDifficultyAvailability) {
      for (let i = 1; i <= MAX_TUBE_LEVEL; ++i) {
        if (this.args.tube.level < i) {
          this.skillAvailabilityMap.push({ difficulty: '', availability: 'out-of-bound' });
        } else {
          const hasSkill = this.args.tube.skills.find((skill) => skill.difficulty === i);
          this.skillAvailabilityMap.push({ difficulty: i, availability: hasSkill ? 'active' : 'missing' });
        }
      }
    }
  }
  get levelOptions() {
    return Array.from({ length: this._maxLevel }, (_, index) => ({
      value: index + 1,
      label: `${index + 1}`,
    }));
  }

  get _maxLevel() {
    return this.args.tube.level;
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
