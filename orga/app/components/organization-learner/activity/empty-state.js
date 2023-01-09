import Component from '@glimmer/component';
import capitalize from 'lodash/capitalize';

export default class EmptyState extends Component {
  get firstName() {
    const { firstName } = this.args;
    return capitalize(firstName);
  }

  get lastName() {
    const { lastName } = this.args;
    return capitalize(lastName);
  }
}
