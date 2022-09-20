import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class Card extends Component {
  @service intl;
  get durationFormatted() {
    const hours = this.args.training.duration.hours + 'h';
    return hours;
  }

  get type() {
    return this.intl.t(`pages.training.type.${this.args.training.type}`);
  }
}
