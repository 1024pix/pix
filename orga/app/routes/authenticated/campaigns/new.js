import { service } from '@ember/service';
import Route from '@ember/routing/route';
import pick from 'lodash/pick';

export default class NewRoute extends Route {
  @service currentUser;
  @service intl;
  @service router;
  @service store;

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
      try {
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
        if (campaignAttributes.targetProfileId) {
          campaignAttributes.targetProfile = this.store.peekRecord(
            'target-profile',
            campaignAttributes.targetProfileId,
          );
        }
      } catch {
        this.router.replaceWith('authenticated.campaigns.new', { queryParams: { source: null } });
      }
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

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('source', null);
    }
  }
}
