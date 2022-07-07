import Component from '@glimmer/component';

export default class Disabled extends Component {
  get hasStages() {
    return this.args.model.totalStagesCount > 0;
  }
}
