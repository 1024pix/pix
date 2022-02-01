import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { inject as service } from '@ember/service';

export default class InvitedRoute extends Route.extend(SecuredRouteMixin) {
  @service campaignStorage;

  beforeModel(transition) {
    if (!transition.from) {
      return this.replaceWith('campaigns.entry-point');
    }
    super.beforeModel(...arguments);
  }

  model() {
    return this.modelFor('campaigns');
  }

  afterModel(campaign) {
    if (this.shouldAssociateWithScoInformation(campaign)) {
      this.replaceWith('campaigns.invited.student-sco', campaign.code);
    } else if (this.shouldAssociateWithSupInformation(campaign)) {
      this.replaceWith('campaigns.invited.student-sup', campaign.code);
    } else {
      this.replaceWith('campaigns.invited.fill-in-participant-external-id', campaign.code);
    }
  }

  shouldAssociateWithScoInformation(campaign) {
    const associationDone = this.campaignStorage.get(campaign.code, 'associationDone');
    return campaign.isOrganizationSCO && campaign.isRestricted && !associationDone;
  }

  shouldAssociateWithSupInformation(campaign) {
    const associationDone = this.campaignStorage.get(campaign.code, 'associationDone');
    return campaign.isOrganizationSUP && campaign.isRestricted && !associationDone;
  }
}
