import Component from '@glimmer/component';

export default class Stage extends Component {
  get isDefaultStage() {
    return (
      (this.args.stage.isTypeLevel && this.args.stage.level === 0) ||
      (!this.args.stage.isTypeLevel && this.args.stage.threshold === 0)
    );
  }
}
