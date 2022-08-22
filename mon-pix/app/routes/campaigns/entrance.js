import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import get from 'lodash/get';

export default class Entrance extends Route {
  @service campaignStorage;
  @service store;
  @service currentUser;
  @service session;
  @service router;

  beforeModel(transition) {
    if (!transition.from) {
      return this.router.replaceWith('campaigns.entry-point');
    }

    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model() {
    return this.modelFor('campaigns');
  }

  async afterModel(campaign) {
    if (await this.shouldBeginCampaignParticipation(campaign)) {
      await this._beginCampaignParticipation(campaign);
    }

    const hasParticipated = this.campaignStorage.get(campaign.code, 'hasParticipated');
    if (!hasParticipated) {
      return;
    }

    if (campaign.isProfilesCollection) {
      this.router.replaceWith('campaigns.profiles-collection.start-or-resume', campaign.code);
    } else {
      this.router.replaceWith('campaigns.assessment.start-or-resume', campaign.code);
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
        return this.router.replaceWith('campaigns.invited.fill-in-participant-external-id', campaign.code);
      }
      if (error.detail === 'ORGANIZATION_LEARNER_HAS_ALREADY_PARTICIPATED') {
        return this.router.replaceWith('campaigns.existing-participation', campaign.code);
      }

      throw err;
    }
  }

  async shouldBeginCampaignParticipation(campaign) {
    const ongoingCampaignParticipation = await this.store.queryRecord('campaignParticipation', {
      campaignId: campaign.id,
      userId: this.currentUser.user.id,
    });
    const hasParticipated = Boolean(ongoingCampaignParticipation);
    this.campaignStorage.set(campaign.code, 'hasParticipated', hasParticipated);
    const retry = this.campaignStorage.get(campaign.code, 'retry');
    return !hasParticipated || (campaign.multipleSendings && retry);
  }
}
