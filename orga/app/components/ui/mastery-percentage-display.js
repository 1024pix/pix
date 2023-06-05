import Component from '@glimmer/component';

export default class MasteryPercentageDisplay extends Component {
  get totalStages() {
    return this.args.hasStages ? this.args.totalStage - 1 : null;
  }

  get reachedStage() {
    return this.args.hasStages ? this.args.reachedStage - 1 : null;
  }
}
