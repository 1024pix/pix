import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ParticipationRow extends Component {
  @service router;

  get routeName() {
    return this.args.participation.campaignType === 'ASSESSMENT'
      ? 'authenticated.campaigns.participant-assessment'
      : 'authenticated.campaigns.participant-profile';
  }

  @action
  goToParticipationDetail(event) {
    event.preventDefault();
    this.router.transitionTo(this.routeName, this.args.participation.campaignId, this.args.participation.id);
  }
}
