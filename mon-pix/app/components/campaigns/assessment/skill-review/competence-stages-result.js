import Component from '@glimmer/component';

export default class CompetenceStagesResult extends Component {
  get total() {
    return this.args.totalStage - 1;
  }
}
