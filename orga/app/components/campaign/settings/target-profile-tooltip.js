import Component from '@glimmer/component';

export default class CampaignTargetProfileTooltip extends Component {
  get displayResultInfo() {
    return this.args.hasStages
      ? {
          icon: 'star',
          label: 'pages.campaign-settings.target-profile.tooltip.content.results.star',
        }
      : {
          icon: 'percent',
          label: 'pages.campaign-settings.target-profile.tooltip.content.results.percent',
        };
  }
}
