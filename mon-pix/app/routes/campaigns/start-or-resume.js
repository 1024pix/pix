import get from 'lodash/get';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class StartOrResumeRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service session;

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

    this._updateStateFrom({ campaign, queryParams: transition.to.queryParams, session: this.session });

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
      return this.replaceWith('campaigns.restricted.join', campaign);
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

    if (this._shouldVisitLandingPageAsVisitor) {
      return this.replaceWith('campaigns.campaign-landing-page', campaign, { queryParams: transition.to.queryParams });
    }

    super.beforeModel(...arguments);
  }

  async model() {
    this.isLoading = true;
    return this.modelFor('campaigns');
  }

  async redirect(campaign, transition) {
    if (campaign.isArchived) {
      this.isLoading = false;
      return;
    }

    await this._findOngoingCampaignParticipation(campaign);

    if (this._shouldVisitLandingPageAsLoggedUser && !campaign.isForAbsoluteNovice) {
      return this.replaceWith('campaigns.campaign-landing-page', campaign);
    }

    if (this._shouldProvideExternalIdToAccessCampaign) {
      return this.replaceWith('campaigns.fill-in-participant-external-id', campaign);
    }

    if (this._shouldStartCampaignParticipation(campaign, transition.to.queryParams)) {
      await this._createCampaignParticipation(campaign);
    }

    if (campaign.isProfilesCollection) {
      this.replaceWith('campaigns.profiles-collection.start-or-resume', campaign);
    } else {
      return this.replaceWith('campaigns.assessment.start-or-resume', campaign);
    }
  }

  _resetState() {
    this.state = {
      campaignCode: null,
      isCampaignRestricted: false,
      isCampaignForSCOOrganization: false,
      isCampaignSimplifiedAccess: false,
      hasUserCompletedRestrictedCampaignAssociation: false,
      hasUserSeenJoinPage: false,
      shouldDisplayLandingPage: true,
      isUserLogged: false,
      doesUserHaveOngoingParticipation: false,
      doesCampaignAskForExternalId: false,
      participantExternalId: null,
      externalUser: null,
      isCampaignPoleEmploi: false,
      isUserLoggedInPoleEmploi: false,
      isCampaignForNoviceUser: false,
    };
  }

  _updateStateFrom({ campaign = {}, queryParams = {}, ongoingCampaignParticipation = null, session }) {
    const hasUserCompletedRestrictedCampaignAssociation = this._handleQueryParamBoolean(queryParams.associationDone, this.state.hasUserCompletedRestrictedCampaignAssociation);
    const isCampaignForNoviceUser = get(campaign, 'isForAbsoluteNovice', this.state.isCampaignForNoviceUser);
    const hasUserSeenJoinPage = this._handleQueryParamBoolean(queryParams.hasUserSeenJoinPage, this.state.hasUserSeenJoinPage);

    const hasUserNotSeenLandingPage = queryParams.hasUserSeenLandingPage == null ? this.state.shouldDisplayLandingPage : !this._handleQueryParamBoolean(queryParams.hasUserSeenLandingPage, false);
    const shouldDisplayLandingPage = isCampaignForNoviceUser ? false : hasUserNotSeenLandingPage;

    this.state = {
      campaignCode: get(campaign, 'code', this.state.campaignCode),
      isCampaignRestricted: get(campaign, 'isRestricted', this.state.isCampaignRestricted),
      isCampaignSimplifiedAccess: get(campaign, 'isSimplifiedAccess', this.state.isCampaignSimplifiedAccess),
      isCampaignForSCOOrganization: get(campaign, 'organizationType') === 'SCO',
      hasUserCompletedRestrictedCampaignAssociation,
      hasUserSeenJoinPage,
      shouldDisplayLandingPage,
      isUserLogged: this.session.isAuthenticated,
      doesUserHaveOngoingParticipation: Boolean(ongoingCampaignParticipation),
      doesCampaignAskForExternalId: get(campaign, 'idPixLabel', this.state.doesCampaignAskForExternalId),
      participantExternalId: get(queryParams, 'participantExternalId', this.state.participantExternalId),
      externalUser: get(session, 'data.externalUser'),
      isCampaignPoleEmploi: get(campaign, 'organizationIsPoleEmploi', this.state.isCampaignPoleEmploi),
      isUserLoggedInPoleEmploi: get(session, 'data.authenticated.source') === 'pole_emploi_connect' || this.state.isUserLoggedInPoleEmploi,
      isCampaignForNoviceUser,
    };
  }

  async _findOngoingCampaignParticipation(campaign) {
    const ongoingCampaignParticipation = await this.store.queryRecord('campaignParticipation', {
      campaignId: campaign.id,
      userId: this.currentUser.user.id,
    });
    this._updateStateFrom({ ongoingCampaignParticipation });
  }

  async _createCampaignParticipation(campaign) {
    try {
      const campaignParticipation = await this.store.createRecord('campaign-participation', { campaign, participantExternalId: this.state.participantExternalId }).save();
      this._updateStateFrom({ ongoingCampaignParticipation: campaignParticipation });
    } catch (err) {
      if (get(err, 'errors[0].status') === 403) {
        this.session.invalidate();
        return this.transitionTo('campaigns.start-or-resume', campaign);
      }
      return this.send('error', err, this.transitionTo('campaigns.start-or-resume'));
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
    return !this.state.shouldDisplayLandingPage
      && this.state.isCampaignSimplifiedAccess
      && !this.state.isUserLogged;
  }

  get _shouldDisconnectAnonymousUser() {
    return this.state.isUserLogged
      && this.currentUser.user.isAnonymous
      && !this.state.participantExternalId;
  }

  get _shouldVisitLandingPageAsVisitor() {
    return this.state.shouldDisplayLandingPage
      && !this.state.isCampaignRestricted
      && !this.state.isUserLogged;
  }

  get _shouldVisitLandingPageAsLoggedUser() {
    return this.state.shouldDisplayLandingPage
      && this.state.isUserLogged
      && !this.state.doesUserHaveOngoingParticipation;
  }

  get _shouldProvideExternalIdToAccessCampaign() {
    return this.state.doesCampaignAskForExternalId
      && !this.state.participantExternalId
      && !this.state.doesUserHaveOngoingParticipation;
  }

  _shouldStartCampaignParticipation(campaign, queryParams) {
    return !this.state.doesUserHaveOngoingParticipation || (campaign.multipleSendings && queryParams.retry);
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
