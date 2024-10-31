import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ResultsLoaderRoute extends Route {
  @service currentUser;
  @service session;
  @service router;
  @service store;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  async model() {
    const campaign = this.modelFor('campaigns');
    const campaignParticipation = await this.store.queryRecord('campaign-participation', {
      campaignId: campaign.id,
      userId: this.currentUser.user.id,
    });
    return {
      campaign,
      campaignParticipation,
    };
  }

  async afterModel({ campaign, campaignParticipation }) {
    const assessment = await campaignParticipation?.assessment;

    if (!campaignParticipation) {
      this.router.replaceWith('campaigns.campaign-landing-page', campaign.code);
    } else if (campaignParticipation.isShared) {
      this.router.replaceWith('campaigns.assessment.results', campaign.code);
    } else if (campaignParticipation && !assessment.isCompleted)
      this.router.replaceWith('campaigns.assessment.start-or-resume', campaign.code);
  }
}
