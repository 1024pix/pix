import { service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class LandingPageStartBlock extends Component {
  @service session;
  @service router;

  get isUserConnected() {
    return this.session.isAuthenticated;
  }

  @action
  async redirectToSigninIfUserIsAnonymous(event) {
    event.preventDefault();

    if (this.isUserConnected) {
      this.router.transitionTo('authenticated');
    } else {
      const transition = this.args.startCampaignParticipation();
      this.session.requireAuthenticationAndApprovedTermsOfService(transition);
    }
  }
}
