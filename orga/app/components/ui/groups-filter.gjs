import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { isSearchValid } from 'pix-orga/utils/normalize-text.js';

export default class GroupsFilter extends Component {
  @service locale;
  @service intl;
  @tracked isLoading;
  @tracked groups;
  @tracked searchQuery = '';

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.args.campaign.groups.then((groups) => {
      this.groups = groups;
      this.isLoading = false;
    });
  }

  get options() {
    return this.groups?.flatMap((group) => {
      if ((this.searchQuery && isSearchValid(group.name, this.searchQuery)) || !this.searchQuery)
        return { value: group.name, label: group.name };

      return [];
    });
  }

  get selectedFields() {
    return (
      this.groups?.filter((group) => this.args.selectedGroups?.includes(group.name)).join(',') ||
      this.intl.t('common.filters.groups.placeholder')
    );
  }

  @action
  onSearch(query) {
    this.searchQuery = query;
  }

  <template>
    {{#if this.isLoading}}
      <div class="groups-filter--is-loading placeholder-box"></div>
    {{else}}
      <PixMultiSelect
        @texts={{hash
          placeholder=(t "common.filters.groups.placeholder")
          emptySearchMessage=(t "common.filters.groups.empty")
          searchLabel=(t "common.filters.search-label-list")
        }}
        @screenReaderOnly={{true}}
        @isSearchable={{true}}
        @onSearch={{this.onSearch}}
        @onChange={{@onSelect}}
        @values={{@selectedGroups}}
        @options={{this.options}}
        ...attributes
      >
        <:default as |option|>{{option.label}}</:default>
        <:placeholder>{{this.selectedFields}}</:placeholder>
        <:label>{{t "common.filters.groups.label"}}</:label>
      </PixMultiSelect>
    {{/if}}
  </template>
}
