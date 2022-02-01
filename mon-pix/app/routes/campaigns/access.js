import get from 'lodash/get';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class AccessRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service session;
  @service campaignStorage;

  beforeModel(transition) {
    if (!transition.from) {
      return this.replaceWith('campaigns.entry-point');
    }

    this.authenticationRoute = 'inscription';
    const campaign = this.modelFor('campaigns');

    if (this._shouldVisitPoleEmploiLoginPage(campaign)) {
      this.session.set('attemptedTransition', transition);
      return this.replaceWith('login-pe');
    } else if (this._shouldLoginToAccessSCORestrictedCampaign(campaign)) {
      this.authenticationRoute = 'campaigns.join.student-sco';
    } else if (this._shouldJoinFromMediacentre(campaign)) {
      this.authenticationRoute = 'campaigns.join.sco-mediacentre';
    } else if (this._shouldJoinSimplifiedCampaignAsAnonymous(campaign)) {
      this.authenticationRoute = 'campaigns.join.anonymous';
    }

    super.beforeModel(...arguments);
  }

  model() {
    return this.modelFor('campaigns');
  }

  async afterModel(campaign) {
    const ongoingCampaignParticipation = await this.store.queryRecord('campaignParticipation', {
      campaignId: campaign.id,
      userId: this.currentUser.user.id,
    });
    const hasParticipated = Boolean(ongoingCampaignParticipation);
    this.campaignStorage.set(campaign.code, 'hasParticipated', hasParticipated);

    if (hasParticipated) {
      this.replaceWith('campaigns.entrance', campaign.code);
    } else {
      this.replaceWith('campaigns.invited', campaign.code);
    }
  }

  _shouldLoginToAccessSCORestrictedCampaign(campaign) {
    const isUserExternal = get(this.session, 'data.externalUser');
    const hasUserSeenJoinPage = this.campaignStorage.get(campaign.code, 'hasUserSeenJoinPage');
    return (
      campaign.isRestricted &&
      campaign.organizationType === 'SCO' &&
      !this.session.isAuthenticated &&
      (!isUserExternal || hasUserSeenJoinPage)
    );
  }

  _shouldVisitPoleEmploiLoginPage(campaign) {
    const isUserLoggedInPoleEmploi = get(this.session, 'data.authenticated.source') === 'pole_emploi_connect';
    return campaign.organizationIsPoleEmploi && !isUserLoggedInPoleEmploi;
  }

  _shouldJoinFromMediacentre(campaign) {
    const isUserExternal = get(this.session, 'data.externalUser');
    return campaign.isRestricted && isUserExternal;
  }

  _shouldJoinSimplifiedCampaignAsAnonymous(campaign) {
    return campaign.isSimplifiedAccess && !this.session.isAuthenticated;
  }
}
