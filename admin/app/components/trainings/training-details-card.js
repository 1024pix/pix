import Component from '@glimmer/component';
import { localeCategories } from '../../models/training';

export default class CreateTrainingForm extends Component {
  get formattedDuration() {
    const days = this.args.training.duration.days ? `${this.args.training.duration.days}j ` : '';
    const hours = this.args.training.duration.hours ? `${this.args.training.duration.hours}h ` : '';
    const minutes = this.args.training.duration.minutes ? `${this.args.training.duration.minutes}min` : '';
    return days + hours + minutes;
  }

  get formattedLocale() {
    return localeCategories[this.args.training.locale];
  }
}
