import Component from '@glimmer/component';

const CEILING_VALUE_FOR_RED = 33;
const CEILING_VALUE_FOR_ORANGE = 66;

export default class SuccessIndicator extends Component {

  get color() {
    const value = this.args.value;
    if (value < CEILING_VALUE_FOR_RED) return 'red';
    if (value < CEILING_VALUE_FOR_ORANGE) return 'orange';
    return 'green';
  }
}
