import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Activity extends Component {
  @tracked statistics = [];

  constructor() {
    super(...arguments);
    Promise.resolve(this.args.statistics).then((statistics) => {
      this.statistics = statistics;
    });
  }

  get assessmentStatistics() {
    return this.statistics.find((stat) => stat.id === 'ASSESSMENT');
  }

  get profileCollectionsStatistics() {
    return this.statistics.find((stat) => stat.id === 'PROFILES_COLLECTION');
  }
}
