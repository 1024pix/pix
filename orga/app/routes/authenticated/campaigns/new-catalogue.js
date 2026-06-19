import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { pick } from 'pix-orga/utils/collection';

export default class NewRoute extends Route {
  @service currentUser;
  @service intl;
  @service router;
  @service store;

  queryParams = {
    source: { refreshModel: true },
  };

  beforeModel() {
    const places = this.modelFor('authenticated');

    if (places?.hasReachedMaximumPlacesLimit) {
      this.router.replaceWith('authenticated.campaigns');
    }
  }

  async model(params) {
    const organization = this.currentUser.organization;
    await organization.targetProfiles;
    await organization.combinedCourseBlueprints;
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
          'externalIdLabel',
          'externalIdType',
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

    const campaign = await this.store.createRecord('campaign', {
      organization,
      ownerId: this.currentUser.prescriber.id,
      ...(campaignAttributes ?? campaignAttributes),
    });

    const targetProfiles = (await organization.targetProfiles) ?? undefined;
    const combinedCourseBlueprints = (await organization.combinedCourseBlueprints) ?? undefined;

    return { campaign, membersSortedByFullName, targetProfiles, combinedCourseBlueprints };
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('source', null);
    }
  }
}
