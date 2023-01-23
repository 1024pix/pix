import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import sortBy from 'lodash/sortBy';
import map from 'lodash/map';

export default class AllTags extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(
      ['isSuperAdmin', 'isSupport', 'isMetier'],
      'authenticated.organizations.get.team'
    );
  }

  async model() {
    const organization = this.modelFor('authenticated.organizations.get');
    const allTags = await this.store.query('tag', { getAllTags: true });

    const organizationTagsNames = map(organization.tags.toArray(), 'name');
    const sortedTags = sortBy(allTags.toArray(), 'name');
    const tagsWithAssignedToOrganizationInformation = map(sortedTags, (tag) => {
      tag.isTagAssignedToOrganization = organizationTagsNames.includes(tag.name);
      return tag;
    });

    return { organization, allTags: tagsWithAssignedToOrganizationInformation };
  }
}
