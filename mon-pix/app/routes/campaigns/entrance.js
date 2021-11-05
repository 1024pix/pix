import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { inject as service } from '@ember/service';
import get from 'lodash/get';

export default class Entrance extends Route.extend(SecuredRouteMixin) {
  @service campaignStorage;
  @service store;
  @service currentUser;

  beforeModel(transition) {
    if (!transition.from) {
      this.replaceWith('campaigns.entry-point');
    }
  }

  model() {
    return this.modelFor('campaigns');
  }

  async afterModel(campaign) {
    if (this.shouldBeginCampaignParticipation(campaign)) {
      await this._beginCampaignParticipation(campaign);
    }
  }

  redirect(campaign) {
    const hasParticipated = this.campaignStorage.get(campaign.code, 'hasParticipated');
    if (!hasParticipated) {
      return;
    }

    if (campaign.isProfilesCollection) {
      this.replaceWith('campaigns.profiles-collection.start-or-resume', campaign);
    } else {
      this.replaceWith('campaigns.assessment.start-or-resume', campaign);
    }
  }

  async _beginCampaignParticipation(campaign) {
    const participantExternalId = this.campaignStorage.get(campaign.code, 'participantExternalId');
    const campaignParticipation = this.store.createRecord('campaign-participation', {
      campaign,
      participantExternalId,
    });

    try {
      await campaignParticipation.save();
      this.campaignStorage.set(campaign.code, 'hasParticipated', true);
    } catch (err) {
      const error = get(err, 'errors[0]', {});
      campaignParticipation.deleteRecord();

      if (error.status == 400 && error.detail.includes('participant-external-id')) {
        this.campaignStorage.set(campaign.code, 'participantExternalId', null);
        return this.replaceWith('campaigns.invited.fill-in-participant-external-id', campaign);
      }

      throw err;
    }
  }

  shouldBeginCampaignParticipation(campaign) {
    const retry = this.campaignStorage.get(campaign.code, 'retry');
    const hasParticipated = this.campaignStorage.get(campaign.code, 'hasParticipated');
    return !hasParticipated || (campaign.multipleSendings && retry);
  }
}
