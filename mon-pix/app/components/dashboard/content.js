import Component from '@glimmer/component';

export default class Content extends Component {
  get hasCampaignParticipationOverviews() {
    return this.args.model.length > 0;
  }
}
