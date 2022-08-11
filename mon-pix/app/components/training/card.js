import Component from '@glimmer/component';

export default class Card extends Component {
  get durationFormatted() {
    const hours = this.args.training.duration.hours + 'h';
    return hours;
  }
}
