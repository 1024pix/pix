import Component from '@glimmer/component';

export default class ReachedStage extends Component {
  // We subtract 1 to not display the "zero" level which does not provide information to the user
  get acquired() {
    return this.args.reachedStage - 1;
  }
  get total() {
    return this.args.totalStage - 1;
  }
}
