import get from 'lodash/get';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
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
    if (this.state.isUserLogged) {
      await this._findOngoingCampaignParticipationAndUpdateState(campaign);
    }

    if (this._shouldVisitPoleEmploiLoginPage) {
      return this._redirectToPoleEmploiLoginPage(transition);
    }

    if (this._shouldLoginToAccessRestrictedCampaign) {
      return this._redirectToLoginBeforeAccessingToCampaign(transition, campaign, !this.state.hasUserSeenJoinPage);
    }

    if (this._shouldJoinRestrictedCampaign) {
      if (!this.state.externalUser && this.currentUser.user.mustValidateTermsOfService) {
        return this._redirectToTermsOfServicesBeforeAccessingToCampaign(transition);
      }

      if (!this.state.doesUserHaveOngoingParticipation) {
        return this.replaceWith('campaigns.restricted.join', campaign);
      }
    }

    if (this._shouldDisconnectAnonymousUser) {
      await this.session.invalidate();
      this.state.isUserLogged = false;
    }

    if (this._shouldJoinSimplifiedCampaignAsAnonymous) {
      this.session.set('attemptedTransition', { retry: () => {} });
      await this.session.authenticate('authenticator:anonymous', { campaignCode: this.state.campaignCode });
      await this.currentUser.load();
    }

    super.beforeModel(...arguments);
  }

  async model() {
    this.isLoading = true;
    return this.modelFor('campaigns');
  }

  async afterModel(campaign) {
    if (this._shouldProvideExternalIdToAccessCampaign) {
      return this.replaceWith('campaigns.fill-in-participant-external-id', campaign);
    }

    if (this._shouldStartCampaignParticipation(campaign)) {
      await this._createCampaignParticipation(campaign);
    }
  }

  async redirect(campaign) {
    if (this.state.doesUserHaveOngoingParticipation) {
      if (campaign.isProfilesCollection) {
        this.replaceWith('campaigns.profiles-collection.start-or-resume', campaign);
      } else {
        return this.replaceWith('campaigns.assessment.start-or-resume', campaign);
      }
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
      doesUserHaveOngoingParticipation: false,
      doesCampaignAskForExternalId: false,
      participantExternalId: null,
      externalUser: null,
      isCampaignPoleEmploi: false,
      isUserLoggedInPoleEmploi: false,
    };
  }

  _updateStateFrom({ campaign = {}, ongoingCampaignParticipation = null, session }) {
    const hasUserCompletedRestrictedCampaignAssociation = this.campaignStorage.get(campaign.code, 'associationDone') || false;
    const hasUserSeenJoinPage = this.campaignStorage.get(campaign.code, 'hasUserSeenJoinPage');
    const participantExternalId = this.campaignStorage.get(campaign.code, 'participantExternalId');
    this.state = {
      campaignCode: get(campaign, 'code', this.state.campaignCode),
      isCampaignRestricted: get(campaign, 'isRestricted', this.state.isCampaignRestricted),
      isCampaignSimplifiedAccess: get(campaign, 'isSimplifiedAccess', this.state.isCampaignSimplifiedAccess),
      isCampaignForSCOOrganization: get(campaign, 'organizationType') === 'SCO',
      hasUserCompletedRestrictedCampaignAssociation,
      hasUserSeenJoinPage,
      isUserLogged: this.session.isAuthenticated,
      doesUserHaveOngoingParticipation: Boolean(ongoingCampaignParticipation),
      doesCampaignAskForExternalId: get(campaign, 'idPixLabel', this.state.doesCampaignAskForExternalId),
      participantExternalId,
      externalUser: get(session, 'data.externalUser'),
      isCampaignPoleEmploi: get(campaign, 'organizationIsPoleEmploi', this.state.isCampaignPoleEmploi),
      isUserLoggedInPoleEmploi: get(session, 'data.authenticated.source') === 'pole_emploi_connect' || this.state.isUserLoggedInPoleEmploi,
    };
  }

  async _findOngoingCampaignParticipationAndUpdateState(campaign) {
    const ongoingCampaignParticipation = await this.store.queryRecord('campaignParticipation', {
      campaignId: campaign.id,
      userId: this.currentUser.user.id,
    });
    this._updateStateFrom({ campaign, ongoingCampaignParticipation });
  }

  async _createCampaignParticipation(campaign) {
    const campaignParticipation = this.store.createRecord('campaign-participation', { campaign, participantExternalId: this.state.participantExternalId });

    try {
      await campaignParticipation.save();
      this._updateStateFrom({ campaign, ongoingCampaignParticipation: campaignParticipation });
    } catch (err) {
      const error = get(err, 'errors[0]', {});
      campaignParticipation.deleteRecord();

      if (error.status == 400 && error.detail.includes('participant-external-id')) {
        return this.replaceWith('campaigns.fill-in-participant-external-id', campaign);
      }

      throw err;
    }
  }

  _shouldResetState(campaignCode) {
    return campaignCode !== this.state.campaignCode;
  }

  _redirectToPoleEmploiLoginPage(transition) {
    this.session.set('attemptedTransition', transition);
    return this.transitionTo('login-pe');
  }

  _redirectToTermsOfServicesBeforeAccessingToCampaign(transition) {
    this.session.set('attemptedTransition', transition);
    return this.transitionTo('terms-of-service');
  }

  _redirectToLoginBeforeAccessingToCampaign(transition, campaign, displayRegisterForm) {
    this.session.set('attemptedTransition', transition);
    return this.transitionTo('campaigns.restricted.login-or-register-to-access', campaign.code, { queryParams: { displayRegisterForm } });
  }

  get _shouldLoginToAccessRestrictedCampaign() {
    return this.state.isCampaignRestricted
      && this.state.isCampaignForSCOOrganization
      && !this.state.isUserLogged
      && (!this.state.externalUser || this.state.hasUserSeenJoinPage);
  }

  get _shouldVisitPoleEmploiLoginPage() {
    return this.state.isCampaignPoleEmploi && !this.state.isUserLoggedInPoleEmploi;
  }

  get _shouldJoinRestrictedCampaign() {
    return this.state.isCampaignRestricted
      && (this.state.isUserLogged || this.state.externalUser)
      && !this.state.hasUserCompletedRestrictedCampaignAssociation;
  }

  get _shouldJoinSimplifiedCampaignAsAnonymous() {
    return this.state.isCampaignSimplifiedAccess
      && !this.state.isUserLogged;
  }

  get _shouldDisconnectAnonymousUser() {
    return this.state.isUserLogged
      && this.currentUser.user.isAnonymous
      && !this.state.participantExternalId;
  }

  get _shouldProvideExternalIdToAccessCampaign() {
    return this.state.doesCampaignAskForExternalId
      && !this.state.participantExternalId
      && !this.state.doesUserHaveOngoingParticipation;
  }

  _shouldStartCampaignParticipation(campaign) {
    const retry = this.campaignStorage.get(campaign.code, 'retry');
    return !this.state.doesUserHaveOngoingParticipation || (campaign.multipleSendings && retry);
  }

  _handleQueryParamBoolean(value, defaultValue) {
    if (isBoolean(value)) {
      return value;
    }

    if (isString(value)) {
      return value.toLowerCase() === 'true';
    }

    return defaultValue;
  }
}
