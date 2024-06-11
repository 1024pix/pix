import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { isTubeSelected } from '../../../helpers/is-tube-selected';

const MAX_TUBE_LEVEL = 8;

export default class Tube extends Component {
  @tracked skillAvailabilityMap = [];

  constructor(...args) {
    super(...args);
    if (this.args.displaySkillDifficultyAvailability) {
      for (let i = 1; i <= MAX_TUBE_LEVEL; ++i) {
        const hasSkill = this.args.tube
          .hasMany('skills')
          .value()
          .find((skill) => skill.difficulty === i);
        this.skillAvailabilityMap.push({ difficulty: i, availability: hasSkill ? 'active' : 'missing' });
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
    return isTubeSelected(this.args.selectedTubeIds, this.args.tube);
  }

  get selectedLevel() {
    return this.args.tubeLevels[this.args.tube.id] || null;
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
      this.setLevelTube(null);
    }
  }

  @action
  setLevelTube(level) {
    const tubeId = this.args.tube.id;
    this.args.setLevelTube(tubeId, level);

    if (level) {
      this.args.checkTube(this.args.tube);
    }
  }
}
