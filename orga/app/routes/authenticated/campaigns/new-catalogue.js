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

    if (params?.courseId) {
      let course = await this.store.peekRecord('course', params.courseId, {
        adapterOptions: { organizationId: organization.id },
      });

      if (!course) {
        const courses = await this.store.findAll('course', {
          adapterOptions: { organizationId: organization.id },
        });
        course = courses.find(({ id }) => id === params.courseId);
      }

      campaign.course = course;

      if (campaign.course.type === 'targetProfile') {
        campaign.type = 'ASSESSMENT';
      }
      if (campaign.course.type === 'blueprint') {
        campaign.type = 'COMBINED_COURSE';
      }
    }

    return { campaign, membersSortedByFullName };
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('source', null);
      controller.set('courseId', null);
    }
  }
}
