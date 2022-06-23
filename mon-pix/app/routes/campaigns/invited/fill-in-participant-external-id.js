import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class FillInParticipantExternalIdRoute extends Route {
  @service campaignStorage;
  @service session;
  @service router;
  @service currentUser;

  beforeModel(transition) {
    const isUserLoaded = !!this.currentUser.user;
    const isAuthenticated = this.session.get('isAuthenticated');
    if (!isAuthenticated || !isUserLoaded) {
      this.session.set('attemptedTransition', transition);
      this.router.transitionTo('login');
    } else if (this.currentUser.user.mustValidateTermsOfService) {
      this.session.set('attemptedTransition', transition);
      this.router.transitionTo('terms-of-service');
    } else {
      return super.beforeModel(...arguments);
    }
  }

  async model() {
    return this.modelFor('campaigns');
  }

  afterModel(campaign) {
    if (!this.shouldProvideExternalId(campaign)) {
      this.router.replaceWith('campaigns.entrance', campaign.code);
    }
  }

  shouldProvideExternalId(campaign) {
    const participantExternalId = this.campaignStorage.get(campaign.code, 'participantExternalId');
    return campaign.idPixLabel && !participantExternalId;
  }
}
