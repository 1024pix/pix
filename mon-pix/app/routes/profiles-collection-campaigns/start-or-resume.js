import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class ProfilesCollectionCampaignsStartOrResumeRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service session;

  campaignCode = null;
  participantExternalId = null;
  associationDone = false;
  userHasSeenLanding = false;
  campaignParticipationIsStarted = false;

  beforeModel(transition) {
    this.campaignCode = transition.to.parent.params.campaign_code;
    this.associationDone = transition.to.queryParams.associationDone;
    this.participantExternalId = transition.to.queryParams.participantExternalId;
    this.userHasSeenLanding = transition.to.queryParams.hasSeenLanding;
    this.campaignParticipationIsStarted = transition.to.queryParams.campaignParticipationIsStarted;
    super.beforeModel(...arguments);
  }

  async model() {
    const campaigns = await this.store.query('campaign', { filter: { code: this.campaignCode } });
    return campaigns.get('firstObject');
  }

  async redirect(campaign) {
    const campaignParticipation = await this.store.queryRecord('campaignParticipation', { campaignId: campaign.id, userId: this.currentUser.user.id });

    if (this.campaignParticipationIsStarted || campaignParticipation) {
      return this.replaceWith('profiles-collection-campaigns.send-profile', this.campaignCode);
    }
    if (this.userHasSeenLanding) {
      return this.replaceWith('campaigns.fill-in-id-pix', this.campaignCode, { queryParams: { participantExternalId: this.participantExternalId } });
    }
    if (!campaign.isRestricted || this.associationDone) {
      return this.replaceWith('campaigns.campaign-landing-page', this.campaignCode, { queryParams: { participantExternalId: this.participantExternalId } });
    }
    return this.replaceWith('restricted-campaigns.join-restricted-campaign', this.campaignCode, { queryParams: { participantExternalId: this.participantExternalId } });
  }
}
