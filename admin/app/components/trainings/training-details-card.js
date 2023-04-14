import Component from '@glimmer/component';
import { localeCategories } from '../../models/training';
import { inject as service } from '@ember/service';

export default class TrainingDetailsCard extends Component {
  @service featureToggles;

  get formattedDuration() {
    const days = this.args.training.duration.days ? `${this.args.training.duration.days}j ` : '';
    const hours = this.args.training.duration.hours ? `${this.args.training.duration.hours}h ` : '';
    const minutes = this.args.training.duration.minutes ? `${this.args.training.duration.minutes}min` : '';
    return `${days}${hours}${minutes}`.trim();
  }

  get formattedLocale() {
    return localeCategories[this.args.training.locale];
  }

  get isTrainingRecommendationEnabled() {
    return this.featureToggles.featureToggles.isTrainingRecommendationEnabled;
  }
}
