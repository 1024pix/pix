import Component from '@glimmer/component';

export default class StageLevelSelect extends Component {
  get levelOptions() {
    return this.args.availableLevels.map((level) => ({
      value: level.toString(),
      label: level.toString(),
    }));
  }
}
