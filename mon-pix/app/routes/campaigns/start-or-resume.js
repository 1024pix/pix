import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class StartOrResumeRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service session;

  campaignCode = null;
  participantExternalId = null;
  campaignIsRestricted = false;
  userHasSeenLanding = false;
  authenticationRoute = 'inscription';

  beforeModel(transition) {
    this.campaignCode = transition.to.parent.params.campaign_code;
    this.participantExternalId = transition.to.queryParams.participantExternalId;
    this.campaignIsRestricted = transition.to.queryParams.campaignIsRestricted;
    this.userHasSeenLanding = transition.to.queryParams.hasSeenLanding;

    if (this._userIsUnauthenticated() && !this.userHasSeenLanding && this.campaignIsRestricted) {
      this.authenticationRoute = 'campaigns.login-or-register-to-access-restricted-campaign';
    }

    if (this._userIsUnauthenticated() && !this.userHasSeenLanding && !this.campaignIsRestricted) {
      return this.replaceWith('campaigns.campaign-landing-page', this.campaignCode, { queryParams: transition.to.queryParams });
    }
    super.beforeModel(...arguments);
  }

  async model() {
    this.isLoading = true;
    const campaigns = await this.store.query('campaign', { filter: { code: this.campaignCode } });

    return campaigns.get('firstObject');
  }

  async redirect(campaign) {

    if (campaign.isArchived) {
      this.isLoading = false;
      return;
    }

    if (campaign.isTypeProfilesCollection) {
      return this.replaceWith('profiles-collection-campaigns.start-or-resume', this.campaignCode, {
        queryParams: {
          participantExternalId: this.participantExternalId,
        }
      });
    }

    return this.replaceWith('assessment-campaigns.start-or-resume', this.campaignCode, {
      queryParams: {
        participantExternalId: this.participantExternalId,
      }
    });
  }

  _userIsUnauthenticated() {
    return this.session.isAuthenticated === false;
  }
}
