import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ParticipationRow extends Component {
  @service router;

  get routeName() {
    return this.args.participation.campaignType === 'ASSESSMENT'
      ? 'authenticated.campaigns.participant-assessment'
      : 'authenticated.campaigns.participant-profile';
  }

  get labels() {
    return {
      ASSESSMENT: 'components.campaign.type.information.ASSESSMENT',
      PROFILES_COLLECTION: 'components.campaign.type.information.PROFILES_COLLECTION',
    };
  }

  @action
  goToParticipationDetail(event) {
    event.preventDefault();
    this.router.transitionTo(this.routeName, this.args.participation.campaignId, this.args.participation.id);
  }
}
