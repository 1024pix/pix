import PixSearchInput from '@1024pix/pix-ui/components/pix-search-input';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
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
  <template>
    <section class="page-section">

      {{#if this.recentlyUsedTags}}
        <h2 class="pix-text--bold pix-text--small">{{t
            "components.organizations.all-tags.recently-used-tags"
            tagName=this.selectedTag.name
          }}</h2>
        <ul class="organization-recently-used-tags-list">
          {{#each this.recentlyUsedTags as |tag|}}
            <li class="organization-recently-used-tags-list__tag">

              {{#if tag.isTagAssignedToOrganization}}
                <button
                  type="button"
                  onClick={{fn this.removeTagToOrganization tag}}
                  aria-label="Tag {{tag.name}} assigné à l'organisation"
                >
                  <PixTag @color="purple-light">
                    {{tag.name}}
                  </PixTag>
                </button>
              {{else}}
                <button
                  type="button"
                  onClick={{fn this.addRecentlyUsedTagToOrganization tag}}
                  aria-label="Tag {{tag.name}} non assigné à l'organisation"
                >
                  <PixTag @color="grey-light">
                    {{tag.name}}
                  </PixTag>
                </button>
              {{/if}}

            </li>
          {{/each}}
        </ul>
      {{/if}}

      <div class="organization-recently-used-tags-list__search-input-container">
        <PixSearchInput
          @screenReaderOnly={{true}}
          @placeholder="Filtrer les tags"
          @debounceTimeInMs={{this.debounceTimeInMs}}
          @triggerFiltering={{this.triggerFiltering}}
        >
          <:label>Filtrer les tags</:label>
        </PixSearchInput>
      </div>

      {{#if this.tagsToShow}}
        <ul class="organization-all-tags-list">
          {{#each this.tagsToShow as |tag|}}
            <li class="organization-all-tags-list__tag">

              {{#if tag.isTagAssignedToOrganization}}
                <button
                  type="button"
                  onClick={{fn this.removeTagToOrganization tag}}
                  aria-label="Tag {{tag.name}} assigné à l'organisation"
                >
                  <PixTag @color="purple-light">
                    {{tag.name}}
                  </PixTag>
                </button>
              {{else}}
                <button
                  type="button"
                  onClick={{fn this.addTagToOrganization tag}}
                  aria-label="Tag {{tag.name}} non assigné à l'organisation"
                >
                  <PixTag @color="grey-light">
                    {{tag.name}}
                  </PixTag>
                </button>
              {{/if}}

            </li>
          {{/each}}
        </ul>
      {{else}}
        <p>Aucun résultat.</p>
      {{/if}}
    </section>
  </template>
}
