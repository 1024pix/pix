import Component from '@glimmer/component';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class OrganizationAllTags extends Component {
  @service store;

  @tracked selectedTag = null;
  @tracked recentlyUsedTags = null;

  get allTags() {
    const organizationTagsNames = map(this.args.model.organization.tags.toArray(), 'name');
    const allTags = sortBy(this.args.model.allTags.toArray(), 'name');

    return map(allTags, (tag) => {
      tag.isTagAssignedToOrganization = organizationTagsNames.includes(tag.name);
      return tag;
    });
  }

  @action
  async addTagToOrganization(tagToAdd) {
    this.args.model.organization.tags.pushObject(tagToAdd);
    await this.args.model.organization.save();
    this.selectedTag = tagToAdd;
    this.recentlyUsedTags = await this.store.query('tag', { tagId: tagToAdd.id, recentlyUsedTags: true });
  }

  @action
  async addRecentlyUsedTagToOrganization(tagToAdd) {
    this.args.model.organization.tags.pushObject(tagToAdd);
    await this.args.model.organization.save();
  }

  @action
  async removeTagToOrganization(tagToRemove) {
    this.args.model.organization.tags.removeObject(tagToRemove);
    await this.args.model.organization.save();
  }
}
