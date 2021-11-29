import get from 'lodash/get';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class StartOrResumeRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service session;
  @service campaignStorage;

  state = null;

  constructor() {
    super(...arguments);
    this._resetState();
  }

  async beforeModel() {
    this.authenticationRoute = 'inscription';
    const campaign = this.modelFor('campaigns');
    if (this._shouldResetState(campaign.code)) {
      this._resetState();
    }

    this._updateStateFrom({ campaign, session: this.session });

    if (this._shouldVisitPoleEmploiLoginPage) {
      this.authenticationRoute = 'login-pe';
    } else if (this._shouldLoginToAccessRestrictedCampaign) {
      this.authenticationRoute = 'campaigns.restricted.login-or-register-to-access';
    } else if (this._shouldJoinFromMediacentre) {
      this.authenticationRoute = 'campaigns.restricted.join-from-mediacentre';
    } else if (this._shouldJoinSimplifiedCampaignAsAnonymous) {
      this.authenticationRoute = 'campaigns.anonymous';
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

  _resetState() {
    if (this?.state?.campaignCode) {
      this.campaignStorage.clear(this.state.campaignCode);
    }
    this.state = {
      campaignCode: null,
      isCampaignRestricted: false,
      isCampaignForSCOOrganization: false,
      isCampaignSimplifiedAccess: false,
      hasUserSeenJoinPage: false,
      isUserLogged: false,
      externalUser: null,
      isCampaignPoleEmploi: false,
      isUserLoggedInPoleEmploi: false,
    };
  }

  _updateStateFrom({ campaign = {}, session }) {
    const hasUserSeenJoinPage = this.campaignStorage.get(campaign.code, 'hasUserSeenJoinPage');
    this.state = {
      campaignCode: get(campaign, 'code', this.state.campaignCode),
      isCampaignRestricted: get(campaign, 'isRestricted', this.state.isCampaignRestricted),
      isCampaignSimplifiedAccess: get(campaign, 'isSimplifiedAccess', this.state.isCampaignSimplifiedAccess),
      isCampaignForSCOOrganization: get(campaign, 'organizationType') === 'SCO',
      hasUserSeenJoinPage,
      isUserLogged: this.session.isAuthenticated,
      externalUser: get(session, 'data.externalUser'),
      isCampaignPoleEmploi: get(campaign, 'organizationIsPoleEmploi', this.state.isCampaignPoleEmploi),
      isUserLoggedInPoleEmploi:
        get(session, 'data.authenticated.source') === 'pole_emploi_connect' || this.state.isUserLoggedInPoleEmploi,
    };
  }

  _shouldResetState(campaignCode) {
    return campaignCode !== this.state.campaignCode;
  }

  get _shouldLoginToAccessRestrictedCampaign() {
    return (
      this.state.isCampaignRestricted &&
      this.state.isCampaignForSCOOrganization &&
      !this.state.isUserLogged &&
      (!this.state.externalUser || this.state.hasUserSeenJoinPage)
    );
  }

  get _shouldVisitPoleEmploiLoginPage() {
    return this.state.isCampaignPoleEmploi && !this.state.isUserLoggedInPoleEmploi;
  }

  get _shouldJoinFromMediacentre() {
    return this.state.isCampaignRestricted && this.state.externalUser;
  }

  get _shouldJoinSimplifiedCampaignAsAnonymous() {
    return this.state.isCampaignSimplifiedAccess && !this.state.isUserLogged;
  }
}
