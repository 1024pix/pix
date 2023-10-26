import Component from '@glimmer/component';

export default class Activity extends Component {
  get assessmentStatistics() {
    return this.args.statistics.find((stat) => stat.id === 'ASSESSMENT');
  }

  get profileCollectionsStatistics() {
    return this.args.statistics.find((stat) => stat.id === 'PROFILES_COLLECTION');
  }
}
