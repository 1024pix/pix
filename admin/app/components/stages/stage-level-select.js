import Component from '@glimmer/component';
import range from 'lodash/range';

export default class StageLevelSelect extends Component {
  get levelOptions() {
    return range(this.args.maxLevel + 1).map((level) => ({
      value: level,
      label: level,
    }));
  }
}
