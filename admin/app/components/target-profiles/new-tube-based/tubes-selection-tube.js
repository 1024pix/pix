import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isTubeSelected } from '../../../helpers/is-tube-selected';

export default class TubesSelectionTube extends Component {
  get levelOptions() {
    return levelOptions;
  }

  get state() {
    return isTubeSelected(this.args.tubesSelected, this.args.tube) ? 'checked' : 'unchecked';
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
  setLevelTube(event) {
    const select = event.currentTarget;
    const level = select.value;
    const tubeId = this.args.tube.id;
    this.args.setLevelTube(tubeId, level);
  }
}

const levelOptions = [
  {
    value: 1,
    label: '1',
  },
  {
    value: 2,
    label: '2',
  },
  {
    value: 3,
    label: '3',
  },
  {
    value: 4,
    label: '4',
  },
  {
    value: 5,
    label: '5',
  },
  {
    value: 6,
    label: '6',
  },
  {
    value: 7,
    label: '7',
  },
  {
    value: 8,
    label: '8',
  },
];
