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

  get _shouldLoginToAccessRestrictedCampaign() {
    return this.state.isCampaignRestricted
      && this.state.isCampaignForSCOOrganization
      && !this.state.isUserLogged
      && (!this.state.externalUser || this.state.hasUserSeenJoinPage);
  }

  _redirectToTermsOfServicesBeforeAccessingToCampaign(transition) {
    this.session.set('attemptedTransition', transition);
    return this.transitionTo('terms-of-service');
  }

  _redirectToLoginBeforeAccessingToCampaign(transition, campaign, displayRegisterForm) {
    this.session.set('attemptedTransition', transition);
    return this.transitionTo('campaigns.restricted.login-or-register-to-access', campaign.code, { queryParams: { displayRegisterForm } });
  }

  async model() {
    this.isLoading = true;
    return this.modelFor('campaigns');
  }

  async redirect(campaign) {
    if (campaign.isArchived) {
      this.isLoading = false;
      return;
    }

    const ongoingCampaignParticipation = await this.store.queryRecord('campaignParticipation', { campaignId: campaign.id, userId: this.currentUser.user.id });
    this._updateStateFrom({ ongoingCampaignParticipation });

    if (this._shouldVisitLandingPageAsLoggedUser) {
      return this.replaceWith('campaigns.campaign-landing-page', campaign);
    }

    if (this._shouldProvideExternalIdToAccessCampaign) {
      return this.replaceWith('campaigns.fill-in-participant-external-id', campaign);
    }

    if (this._shouldStartCampaignParticipation) {
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

    if (campaign.isProfilesCollection) {
      return this.replaceWith('campaigns.profiles-collection.start-or-resume', campaign);
    } else {
      return this.replaceWith('campaigns.assessment.start-or-resume', campaign);
    }
  }

  get _shouldJoinRestrictedCampaign() {
    return this.state.isCampaignRestricted
      && (this.state.isUserLogged || this.state.externalUser)
      && !this.state.hasUserCompletedRestrictedCampaignAssociation;
  }

  _shouldResetState(campaignCode) {
    return campaignCode !== this.state.campaignCode;
  }

  beforeModel(transition) {
    this.authenticationRoute = 'inscription';
    const campaign = this.modelFor('campaigns');
    if (this._shouldResetState(campaign.code)) {
      this._resetState();
    }
    this._updateStateFrom({ campaign, queryParams: transition.to.queryParams, session: this.session });

    if (this._shouldLoginToAccessRestrictedCampaign) {
      return this._redirectToLoginBeforeAccessingToCampaign(transition, campaign, !this.state.hasUserSeenJoinPage);
    }

    if (this._shouldJoinRestrictedCampaign) {
      if (!this.state.externalUser && this.currentUser.user.mustValidateTermsOfService) {
        return this._redirectToTermsOfServicesBeforeAccessingToCampaign(transition);
      }
      return this.replaceWith('campaigns.restricted.join', campaign);
    }

    if (this._shouldVisitLandingPageAsVisitor) {
      return this.replaceWith('campaigns.campaign-landing-page', campaign, { queryParams: transition.to.queryParams });
    }

    super.beforeModel(...arguments);
  }

  _resetState() {
    this.state = {
      campaignCode: null,
      isCampaignRestricted: false,
      isCampaignForSCOOrganization: false,
      hasUserCompletedRestrictedCampaignAssociation: false,
      hasUserSeenJoinPage: false,
      hasUserSeenLandingPage: false,
      isUserLogged: false,
      doesUserHaveOngoingParticipation: false,
      doesCampaignAskForExternalId: false,
      participantExternalId: null,
      externalUser: null,
    };
  }

  _updateStateFrom({ campaign = {}, queryParams = {}, ongoingCampaignParticipation = null, session }) {
    const hasUserCompletedRestrictedCampaignAssociation = this._handleQueryParamBoolean(queryParams.associationDone, this.state.hasUserCompletedRestrictedCampaignAssociation);
    const hasUserSeenLandingPage = this._handleQueryParamBoolean(queryParams.hasUserSeenLandingPage, this.state.hasUserSeenLandingPage);
    const hasUserSeenJoinPage = this._handleQueryParamBoolean(queryParams.hasUserSeenJoinPage, this.state.hasUserSeenJoinPage);
    this.state = {
      campaignCode: get(campaign, 'code', this.state.campaignCode),
      isCampaignRestricted: get(campaign, 'isRestricted', this.state.isCampaignRestricted),
      isCampaignForSCOOrganization: get(campaign, 'organizationType') === 'SCO',
      hasUserCompletedRestrictedCampaignAssociation,
      hasUserSeenJoinPage,
      hasUserSeenLandingPage,
      isUserLogged: this.session.isAuthenticated,
      doesUserHaveOngoingParticipation: Boolean(ongoingCampaignParticipation),
      doesCampaignAskForExternalId: get(campaign, 'idPixLabel', this.state.doesCampaignAskForExternalId),
      participantExternalId: get(queryParams, 'participantExternalId', this.state.participantExternalId),
      externalUser: get(session, 'data.externalUser'),
    };
  }

  get _shouldVisitLandingPageAsVisitor() {
    return !this.state.hasUserSeenLandingPage
      && !this.state.isCampaignRestricted
      && !this.state.isUserLogged;
  }

  get _shouldVisitLandingPageAsLoggedUser() {
    return !this.state.hasUserSeenLandingPage
      && this.state.isUserLogged
      && !this.state.doesUserHaveOngoingParticipation;
  }

  get _shouldProvideExternalIdToAccessCampaign() {
    return this.state.doesCampaignAskForExternalId
      && !this.state.participantExternalId
      && !this.state.doesUserHaveOngoingParticipation;
  }

  get _shouldStartCampaignParticipation() {
    return !this.state.doesUserHaveOngoingParticipation;
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
