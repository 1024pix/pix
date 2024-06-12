import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-admin/config/environment';

export default class OrganizationAllTags extends Component {
  @service store;

  @tracked selectedTag = null;
  @tracked recentlyUsedTags = null;
  @tracked tagsToShow = [];

  constructor() {
    super(...arguments);
    this.tagsToShow = this.args.model.allTags;
  }

  get allTags() {
    return this.args.model.allTags;
  }

  get debounceTimeInMs() {
    return ENV.pagination.debounce;
  }

  searchInputElementValue(elementId) {
    return document.getElementById(elementId).value;
  }

  @action
  async triggerFiltering(elementId) {
    const valueToSearch = this.searchInputElementValue(elementId)
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    this.tagsToShow = this.allTags.filter((tag) => tag.name.toUpperCase().includes(valueToSearch));
  }

  @action
  async addTagToOrganization(tagToAdd) {
    const tags = await this.args.model.organization.tags;
    tags.pushObject(tagToAdd);
    await this.args.model.organization.save();
    this.selectedTag = tagToAdd;
    this.recentlyUsedTags = await this.store.query('tag', { tagId: tagToAdd.id, recentlyUsedTags: true });
    tagToAdd.isTagAssignedToOrganization = true;
  }

  @action
  async addRecentlyUsedTagToOrganization(tagToAdd) {
    const tags = await this.args.model.organization.tags;
    tags.pushObject(tagToAdd);
    await this.args.model.organization.save();
    tagToAdd.isTagAssignedToOrganization = true;
  }

  @action
  async removeTagToOrganization(tagToRemove) {
    const tags = await this.args.model.organization.tags;
    tags.removeObject(tagToRemove);
    await this.args.model.organization.save();
    this.selectedTag = null;
    this.recentlyUsedTags = null;
    tagToRemove.isTagAssignedToOrganization = false;
  }
}
