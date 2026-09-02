import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { isSearchValid } from 'pix-orga/utils/normalize-text.js';

export default class DivisionsFilter extends Component {
  @service locale;
  @service intl;
  @tracked isLoading;
  @tracked divisions;
  @tracked searchQuery = '';

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.args.model.divisions.then((divisions) => {
      this.divisions = divisions;
      this.isLoading = false;
    });
  }

  get selectedFields() {
    return (
      this.divisions?.filter((division) => this.args.selected?.includes(division.name)).join(',') ||
      this.intl.t('common.filters.divisions.placeholder')
    );
  }

  get options() {
    return this.divisions?.flatMap((division) => {
      if ((this.searchQuery && isSearchValid(division.name, this.searchQuery)) || !this.searchQuery)
        return { value: division.name, label: division.name };

      return [];
    });
  }

  @action
  onSearch(query) {
    this.searchQuery = query;
  }

  <template>
    {{#if this.isLoading}}
      <div class="divisions-filter--is-loading placeholder-box"></div>
    {{else}}
      <PixMultiSelect
        @texts={{hash
          placeholder=(t "common.filters.divisions.placeholder")
          emptySearchMessage=(t "common.filters.divisions.empty")
          searchLabel=(t "common.filters.search-label-list")
        }}
        @screenReaderOnly={{true}}
        @values={{@selected}}
        @onChange={{@onSelect}}
        @options={{this.options}}
        @isSearchable={{true}}
        @onSearch={{this.onSearch}}
        ...attributes
      >
        <:label>{{t "common.filters.divisions.label"}}</:label>
        <:placeholder>{{this.selectedFields}}</:placeholder>
        <:default as |option|>{{option.label}}</:default>
      </PixMultiSelect>
    {{/if}}
  </template>
}
