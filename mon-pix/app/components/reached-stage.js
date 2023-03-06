import Component from '@glimmer/component';

export default class ReachedStage extends Component {
  get acquired() {
    return this.args.reachedStage - 1;
  }
  get total() {
    return this.args.totalStage - 1;
  }
}
