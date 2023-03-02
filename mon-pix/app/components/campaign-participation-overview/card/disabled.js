import Component from '@glimmer/component';

export default class Disabled extends Component {
  get hasStages() {
    return this.args.model.totalStagesCount > 0;
  }

  get count() {
    return this.args.model.validatedStagesCount - 1;
  }

  get total() {
    return this.args.model.totalStagesCount - 1;
  }
}
