import Component from '@glimmer/component';

export default class Archived extends Component {
  get isCompleted() {
    return this.args.model.assessmentState === 'completed';
  }

  get hasStages() {
    return this.args.model.totalStagesCount > 0;
  }
}
