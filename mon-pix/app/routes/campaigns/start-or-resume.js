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

  async beforeModel(transition) {
    this.authenticationRoute = 'inscription';
    const campaign = this.modelFor('campaigns');
    if (this._shouldResetState(campaign.code)) {
      this._resetState();
    }

    this._updateStateFrom({ campaign, session: this.session });

    if (this._shouldVisitPoleEmploiLoginPage) {
      return this._redirectToPoleEmploiLoginPage(transition);
    }

    if (this._shouldLoginToAccessRestrictedCampaign) {
      return this._redirectToLoginBeforeAccessingToCampaign(transition, campaign, !this.state.hasUserSeenJoinPage);
    }

    if (this._shouldValidateTermsOfService) {
      return this._redirectToTermsOfServicesBeforeAccessingToCampaign(transition);
    }

    if (this._shouldJoinFromMediacentre) {
      return this.replaceWith('campaigns.restricted.join-from-mediacentre', campaign.code);
    }

    if (this._shouldJoinSimplifiedCampaignAsAnonymous) {
      this.session.set('attemptedTransition', { retry: () => {} });
      await this.session.authenticate('authenticator:anonymous', { campaignCode: this.state.campaignCode });
      await this.currentUser.load();
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
      hasUserCompletedRestrictedCampaignAssociation: false,
      hasUserSeenJoinPage: false,
      isUserLogged: false,
      externalUser: null,
      isCampaignPoleEmploi: false,
      isUserLoggedInPoleEmploi: false,
    };
  }

  _updateStateFrom({ campaign = {}, session }) {
    const hasUserCompletedRestrictedCampaignAssociation =
      this.campaignStorage.get(campaign.code, 'associationDone') || false;
    const hasUserSeenJoinPage = this.campaignStorage.get(campaign.code, 'hasUserSeenJoinPage');
    this.state = {
      campaignCode: get(campaign, 'code', this.state.campaignCode),
      isCampaignRestricted: get(campaign, 'isRestricted', this.state.isCampaignRestricted),
      isCampaignSimplifiedAccess: get(campaign, 'isSimplifiedAccess', this.state.isCampaignSimplifiedAccess),
      isCampaignForSCOOrganization: get(campaign, 'organizationType') === 'SCO',
      hasUserCompletedRestrictedCampaignAssociation,
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

  _redirectToPoleEmploiLoginPage(transition) {
    this.session.set('attemptedTransition', transition);
    return this.replaceWith('login-pe');
  }

  _redirectToTermsOfServicesBeforeAccessingToCampaign(transition) {
    this.session.set('attemptedTransition', transition);
    return this.replaceWith('terms-of-service');
  }

  _redirectToLoginBeforeAccessingToCampaign(transition, campaign, displayRegisterForm) {
    this.session.set('attemptedTransition', transition);
    return this.replaceWith('campaigns.restricted.login-or-register-to-access', campaign.code, {
      queryParams: { displayRegisterForm },
    });
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
    return (
      this.state.isCampaignRestricted &&
      this.state.externalUser &&
      !this.state.hasUserCompletedRestrictedCampaignAssociation
    );
  }

  get _shouldJoinSimplifiedCampaignAsAnonymous() {
    return this.state.isCampaignSimplifiedAccess && !this.state.isUserLogged;
  }

  get _shouldValidateTermsOfService() {
    return this.state.isUserLogged && !this.state.externalUser && this.currentUser.user.mustValidateTermsOfService;
  }
}
