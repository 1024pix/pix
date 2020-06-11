import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import _ from 'lodash';

export default class StartOrResumeRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service session;

  state = {
    campaignCode: null,
    participantExternalId: null,
    userHasSeenLanding: false,
    associationDone: false,
    userHasConsultedTutorial: false,
  };
  authenticationRoute = 'inscription';

  beforeModel(transition) {
    this._updateState(transition.to);
    const campaign = this.modelFor('campaigns');

    if (campaign.isRestricted) {
      this.authenticationRoute = 'campaigns.login-or-register-to-access-restricted-campaign';
      if (this.session.isAuthenticated && !this.currentUser.user.mustValidateTermsOfService && !this.state.associationDone) {
        return this.replaceWith('campaigns.join-restricted-campaign', this.state.campaignCode);
      }
      if (this.state.associationDone && !this.state.userHasSeenLanding) {
        return this.replaceWith('campaigns.campaign-landing-page', this.state.campaignCode);
      }
    } else {
      if (!this.session.isAuthenticated && !this.state.userHasSeenLanding) {
        return this.replaceWith('campaigns.campaign-landing-page', this.state.campaignCode);
      }
    }

    super.beforeModel(...arguments);
  }

  model() {
    this.isLoading = true;
    const campaign = this.modelFor('campaigns');
    return this.store.queryRecord('campaignParticipation', { campaignId: campaign.id, userId: this.currentUser.user.id });
  }

  async redirect(existingCampaignParticipation) {
    const campaign = this.modelFor('campaigns');
    if (campaign.isArchived) {
      this.isLoading = false;
      return;
    }

    if (!existingCampaignParticipation) {
      if (!this.state.userHasSeenLanding) {
        return this.replaceWith('campaigns.campaign-landing-page', this.state.campaignCode);
      }
      if (campaign.idPixLabel && !this.state.participantExternalId) {
        return this.replaceWith('campaigns.fill-in-id-pix', this.state.campaignCode);
      }
      try {
        await this.store.createRecord('campaign-participation', { campaign, participantExternalId: this.state.participantExternalId }).save();
        return this.refresh();
      } catch (err) {
        if (_.get(err, 'errors[0].status') === 403) {
          this.session.invalidate();
          return this.transitionTo('campaigns.start-or-resume', this.campaignCode);
        }
        return this.send('error', err, this.transitionTo('campaigns.start-or-resume'));
      }
    }

    if (campaign.isTypeAssessment) {
      await this._handleEvaluation(campaign);
    } else {
      this._handleProfilesCollection(existingCampaignParticipation);
    }
  }

  _mustShowTutorial(assessment) {
    return (
      !this.state.userHasConsultedTutorial
      && _.get(assessment, 'answers.length', 0) === 0
      && !_.get(assessment, 'isCompleted', false)
      && !this.currentUser.user.hasSeenAssessmentInstructions
    );
  }

  _handleProfilesCollection(campaignParticipation) {
    if (campaignParticipation.isShared) {
      return this.replaceWith('campaigns.profile-already-shared', this.state.campaignCode);
    }
    return this.replaceWith('campaigns.send-profile', this.state.campaignCode);
  }

  async _handleEvaluation(campaign) {
    const smartPlacementAssessments = await this.store.query(
      'assessment',
      { filter: { type: 'SMART_PLACEMENT', codeCampaign: campaign.code } },
    );
    const assessment = await smartPlacementAssessments.get('firstObject');

    if (this._mustShowTutorial(assessment)) {
      return this.replaceWith('campaigns.tutorial', this.state.campaignCode);
    }

    this.replaceWith('assessments.resume', assessment.id);
  }

  _updateState(transitionTo) {
    this.state.campaignCode = _.get(transitionTo, 'parent.params.campaign_code', this.state.campaignCode);
    this.state.participantExternalId = _.get(transitionTo, 'queryParams.participantExternalId', this.state.participantExternalId);
    this.state.userHasSeenLanding = _.get(transitionTo, 'queryParams.userHasSeenLanding', this.state.userHasSeenLanding);
    this.state.associationDone = _.get(transitionTo, 'queryParams.associationDone', this.state.associationDone);
    this.state.userHasConsultedTutorial = _.get(transitionTo, 'queryParams.userHasConsultedTutorial', this.state.userHasConsultedTutorial);
  }
}
