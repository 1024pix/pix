import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import _ from 'lodash';

@classic
export default class FillInIdPixRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service session;

  givenParticipantExternalId = null;

  deactivate() {
    this.controller.set('participantExternalId', null);
    this.controller.set('isLoading', false);
  }

  async beforeModel(transition) {
    const campaignCode = transition.to.params.campaign_code;
    this.set('givenParticipantExternalId', transition.to.queryParams && transition.to.queryParams.givenParticipantExternalId);

    const assessments = await this.store.query('assessment', { filter: { codeCampaign: campaignCode } });

    if (!isEmpty(assessments)) {
      return this.replaceWith('campaigns.start-or-resume', campaignCode);
    }
  }

  async model(params) {
    const campaigns = await this.store.query('campaign', { filter: { code: params.campaign_code } });

    return campaigns.get('firstObject');
  }

  afterModel(campaign) {
    if (!campaign.idPixLabel) {
      return this.start(campaign);
    }

    if (this.givenParticipantExternalId) {
      return this.start(campaign, this.givenParticipantExternalId);
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('start', (campaign, participantExternalId) => this.start(campaign, participantExternalId));
  }

  start(campaign, participantExternalId = null) {
    return this.store.createRecord('campaign-participation', { campaign, participantExternalId })
      .save()
      .then(() => {
        return this.transitionTo('campaigns.start-or-resume', campaign.code, { queryParams: { campaignParticipationIsStarted: true } });
      }, (err) => {
        if (_.get(err, 'errors[0].status') === 403) {
          this.session.invalidate();
          return this.transitionTo('campaigns.start-or-resume', campaign.code, { queryParams: { campaignParticipationIsStarted: true } });
        }
        return this.send('error', err, this.transitionTo('campaigns.start-or-resume', campaign.code, { queryParams: { campaignParticipationIsStarted: true } }));
      });
  }
}
