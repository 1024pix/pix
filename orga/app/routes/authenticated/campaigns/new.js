import { service } from '@ember/service';
import Route from '@ember/routing/route';
import pick from 'lodash/pick';

export default class NewRoute extends Route {
  @service store;
  @service currentUser;
  @service intl;

  queryParams = {
    source: { refreshModel: true },
  };

  async model(params) {
    const organization = this.currentUser.organization;
    await organization.targetProfiles;
    const membersSortedByFullName = await this.store.findAll('member-identity', {
      adapterOptions: { organizationId: organization.id },
    });

    let campaignAttributes;
    if (params?.source) {
      const from = await this.store.findRecord('campaign', params.source);
      campaignAttributes = pick(from, [
        'type',
        'title',
        'description',
        'targetProfileId',
        'ownerId',
        'multipleSendings',
        'idPixLabel',
        'customLandingPageText',
      ]);
      campaignAttributes.name = `${this.intl.t('pages.campaign-creation.copy-of')} ${from.name}`;
      campaignAttributes.targetProfile = this.store.peekRecord('target-profile', campaignAttributes.targetProfileId);
    }

    return {
      campaign: this.store.createRecord('campaign', {
        organization,
        ownerId: this.currentUser.prescriber.id,
        ...(campaignAttributes ?? campaignAttributes),
      }),
      targetProfiles: organization.targetProfiles,
      membersSortedByFullName,
    };
  }
}
