import Component from '@glimmer/component';

export default class TickOrCross extends Component {
  get icon() {
    return this.args.isTrue ? 'check' : 'times';
  }

  get class() {
    return this.args.isTrue ? 'tick-or-cross--valid' : 'tick-or-cross--invalid';
  }
}
