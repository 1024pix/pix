import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { isSearchValid } from 'pix-orga/utils/normalize-text.js';

export default class MultiSelectFilter extends Component {
  @service locale;
  @tracked searchQuery = '';

  @action
  onSelect(value) {
    const { onSelect, field } = this.args;
    onSelect(field, value);
  }

  @action
  onSearch(query) {
    this.searchQuery = query;
  }

  get options() {
    return this.args.options?.flatMap((options) => {
      if ((this.searchQuery && isSearchValid(options.label, this.searchQuery)) || !this.searchQuery) return options;

      return [];
    });
  }

  get selectedFields() {
    return (
      this.args.options?.filter((division) => this.args.selectedOption?.includes(division.name)).join(',') ||
      this.args.placeholder
    );
  }

  <template>
    {{#if @isLoading}}
      <div class="multi-select-filter--is-loading placeholder-box"></div>
    {{else}}
      <PixMultiSelect
        @texts={{hash
          placeholder=@placeholder
          emptySearchMessage=@emptyMessage
          searchLabel=(t "common.filters.search-label-list")
        }}
        @screenReaderOnly={{true}}
        @isSearchable={{true}}
        @onSearch={{this.onSearch}}
        @onChange={{this.onSelect}}
        @values={{@selectedOption}}
        @options={{this.options}}
      >
        <:label>{{@label}}</:label>
        <:placeholder>{{this.selectedFields}}</:placeholder>
        <:default as |option|>{{option.label}}</:default>
      </PixMultiSelect>
    {{/if}}
  </template>
}
