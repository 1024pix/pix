import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isSearchValid } from 'pix-admin/utils/normalize-text.js';

export default class MultiSelectSearchWrapper extends Component {
  @tracked searchQuery;

  @action
  onSearch(query) {
    this.searchQuery = query;
  }

  get availableOptions() {
    return this.args.options.flatMap((option) => {
      if ((this.searchQuery && isSearchValid(option.label, this.searchQuery)) || !this.searchQuery) return option;

      return [];
    });
  }

  <template>
    <PixMultiSelect
      @id={{@id}}
      @inlineLabel={{@inlineLabel}}
      @size={{@size}}
      @texts={{hash placeholder=@firstItem emptySearchMessage="Pas de résultat" searchLabel="Rechercher"}}
      @isSearchable={{true}}
      @onSearch={{this.onSearch}}
      @values={{@values}}
      @options={{this.availableOptions}}
      @onChange={{@onChange}}
      @isDisabled={{@isDisabled}}
      ...attributes
    >
      <:label>
        {{yield to="label"}}
      </:label>

      <:placeholder>
        {{yield to="placeholder"}}
      </:placeholder>

      <:default as |option|>
        {{option.label}}
      </:default>
    </PixMultiSelect>
  </template>
}
