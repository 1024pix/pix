import Component from '@glimmer/component';

export default class Ended extends Component {
  get hasStages() {
    return this.args.model.totalStagesCount > 0;
  }
}
