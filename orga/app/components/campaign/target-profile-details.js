import Component from '@glimmer/component';

export default class CampaignTargetProfileDetails extends Component {
  get displayResultInfo() {
    return this.args.hasStages
      ? {
          icon: 'star',
          label: 'common.target-profile-details.results.star',
        }
      : {
          icon: 'percent',
          label: 'common.target-profile-details.results.percent',
        };
  }
}
