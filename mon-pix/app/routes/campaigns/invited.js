import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class InvitedRoute extends Route {
  @service campaignStorage;
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

  afterModel(campaign) {
    const associationDone = this.campaignStorage.get(campaign.code, 'associationDone');

    if (this.shouldAssociateInformation(campaign, associationDone)) {
      this.router.replaceWith('campaigns.invited.reconciliation', campaign.code);
    } else if (this.shouldAssociateWithScoInformation(campaign, associationDone)) {
      this.router.replaceWith('campaigns.invited.student-sco', campaign.code);
    } else if (this.shouldAssociateWithSupInformation(campaign, associationDone)) {
      this.router.replaceWith('campaigns.invited.student-sup', campaign.code);
    } else {
      this.router.replaceWith('campaigns.invited.fill-in-participant-external-id', campaign.code);
    }
  }

  shouldAssociateInformation(campaign, associationDone) {
    return !associationDone && campaign.isReconciliationRequired;
  }

  shouldAssociateWithScoInformation(campaign, associationDone) {
    return campaign.isOrganizationSCO && campaign.isRestricted && !associationDone;
  }

  shouldAssociateWithSupInformation(campaign, associationDone) {
    return campaign.isOrganizationSUP && campaign.isRestricted && !associationDone;
  }
}
