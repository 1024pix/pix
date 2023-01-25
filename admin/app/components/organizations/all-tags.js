import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import ENV from 'pix-admin/config/environment';

export default class OrganizationAllTags extends Component {
  @service store;

  @tracked selectedTag = null;
  @tracked recentlyUsedTags = null;
  @tracked allTags = this.args.model.allTags;
  @tracked tagsToShow = this.args.model.allTags;

  get debounceTimeInMs() {
    return ENV.pagination.debounce;
  }

  @action
  async triggerFiltering(value) {
    const searchInputElement = document.getElementById(value);
    this.tagsToShow = this.allTags.filter((tag) =>
      tag.name.toUpperCase().includes(searchInputElement.value.toUpperCase())
    );
  }

  @action
  async addTagToOrganization(tagToAdd) {
    this.args.model.organization.tags.pushObject(tagToAdd);
    await this.args.model.organization.save();
    this.selectedTag = tagToAdd;
    this.recentlyUsedTags = await this.store.query('tag', { tagId: tagToAdd.id, recentlyUsedTags: true });
    tagToAdd.isTagAssignedToOrganization = true;
  }

  @action
  async addRecentlyUsedTagToOrganization(tagToAdd) {
    this.args.model.organization.tags.pushObject(tagToAdd);
    await this.args.model.organization.save();
    tagToAdd.isTagAssignedToOrganization = true;
  }

  @action
  async removeTagToOrganization(tagToRemove) {
    this.args.model.organization.tags.removeObject(tagToRemove);
    await this.args.model.organization.save();
    this.selectedTag = null;
    this.recentlyUsedTags = null;
    tagToRemove.isTagAssignedToOrganization = false;
  }
}
