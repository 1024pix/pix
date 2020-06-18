import _ from 'lodash';
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

  beforeModel(transition) {
    this.authenticationRoute = 'inscription';
    const campaign = this.modelFor('campaigns');
    this._updateStateFrom({ campaign, queryParams: transition.to.queryParams });

    if (this._shouldLoginToAccessRestrictedCampaign) {
      return this._redirectToLoginBeforeAccessingToCampaign(transition, campaign);
    }

    if (this._shouldJoinRestrictedCampaign) {
      if (this.currentUser.user.mustValidateTermsOfService) {
        return this._redirectToTermsOfServicesBeforeAccessingToCampaign(transition);
      }
      return this.replaceWith('campaigns.restricted.join', campaign);
    }

    if (this._shouldVisitLandingPageAsVisitor) {
      return this.replaceWith('campaigns.campaign-landing-page', campaign, { queryParams: transition.to.queryParams });
    }

    super.beforeModel(...arguments);
  }

  _redirectToTermsOfServicesBeforeAccessingToCampaign(transition) {
    this.session.set('attemptedTransition', transition);
    return this.transitionTo('terms-of-service');
  }

  _redirectToLoginBeforeAccessingToCampaign(transition, campaign) {
    this.session.set('attemptedTransition', transition);
    return this.transitionTo('campaigns.restricted.login-or-register-to-access', campaign.code);
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
      return this.replaceWith('campaigns.fill-in-id-pix', campaign);
    }

    if (this._shouldStartCampaignParticipation) {
      try {
        const campaignParticipation = await this.store.createRecord('campaign-participation', { campaign, participantExternalId: this.state.participantExternalId }).save();
        this._updateStateFrom({ ongoingCampaignParticipation: campaignParticipation });
      } catch (err) {
        if (_.get(err, 'errors[0].status') === 403) {
          this.session.invalidate();
          return this.transitionTo('campaigns.start-or-resume', campaign);
        }
        return this.send('error', err, this.transitionTo('campaigns.start-or-resume'));
      }
    }

    if (campaign.isTypeProfilesCollection) {
      return this.replaceWith('campaigns.profiles-collection.start-or-resume', campaign);
    } else {
      return this.replaceWith('campaigns.assessment.start-or-resume', campaign);
    }
  }

  _resetState() {
    this.state = {
      isCampaignRestricted: false,
      hasUserCompletedRestrictedCampaignAssociation: false,
      hasUserSeenLandingPage: false,
      isUserLogged: false,
      doesUserHaveOngoingParticipation: false,
      doesCampaignAskForExternalId: false,
      participantExternalId: null,
    };
  }

  _updateStateFrom({ campaign = {}, queryParams = {}, ongoingCampaignParticipation = null }) {
    const hasUserCompletedRestrictedCampaignAssociation = this._handleQueryParamBoolean(queryParams.associationDone, this.state.hasUserCompletedRestrictedCampaignAssociation);
    const hasUserSeenLandingPage = this._handleQueryParamBoolean(queryParams.hasUserSeenLandingPage, this.state.hasUserSeenLandingPage);
    this.state = {
      isCampaignRestricted: _.get(campaign, 'isRestricted', this.state.isCampaignRestricted),
      hasUserCompletedRestrictedCampaignAssociation,
      hasUserSeenLandingPage,
      isUserLogged: this.session.isAuthenticated,
      doesUserHaveOngoingParticipation: Boolean(ongoingCampaignParticipation),
      doesCampaignAskForExternalId: _.get(campaign, 'idPixLabel', this.state.doesCampaignAskForExternalId),
      participantExternalId: _.get(queryParams, 'participantExternalId', this.state.participantExternalId),
    };
  }

  get _shouldLoginToAccessRestrictedCampaign() {
    return this.state.isCampaignRestricted
      && !this.state.isUserLogged;
  }

  get _shouldJoinRestrictedCampaign() {
    return this.state.isCampaignRestricted
      && this.state.isUserLogged
      && !this.state.hasUserCompletedRestrictedCampaignAssociation;
  }

  get _shouldVisitLandingPageAsVisitor() {
    return !this.state.hasUserSeenLandingPage
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
    if (_.isBoolean(value)) {
      return value;
    }

    if (_.isString(value)) {
      return value.toLowerCase() === 'true';
    }

    return defaultValue;
  }
}
