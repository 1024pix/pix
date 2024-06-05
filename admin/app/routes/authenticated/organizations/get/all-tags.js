import Route from '@ember/routing/route';
import { service } from '@ember/service';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';

export default class AllTags extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(
      ['isSuperAdmin', 'isSupport', 'isMetier'],
      'authenticated.organizations.get.team',
    );
  }

  async model() {
    const organization = this.modelFor('authenticated.organizations.get');
    const organizationTags = await organization.tags;
    const allTags = await this.store.query('tag', { getAllTags: true });
    const organizationTagsNames = map(organizationTags, 'name');
    const sortedTags = sortBy(allTags, 'name');
    const tagsWithAssignedToOrganizationInformation = map(sortedTags, (tag) => {
      tag.isTagAssignedToOrganization = organizationTagsNames.includes(tag.name);
      return tag;
    });

    return { organization, allTags: tagsWithAssignedToOrganizationInformation };
  }
}
