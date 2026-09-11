import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isSearchValid } from 'pix-admin/utils/normalize-text.js';

export default class SelectSearchWrapper extends Component {
  @service intl;

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

  get texts() {
    return {
      placeholder: this.args.texts.placeholder,
      selectSearchLabel: this.args.texts.selectSearchLabel ?? this.intl.t('common.actions.search'),
      searchPlaceholder: this.args.texts.searchPlaceholder,
      emptySearchMessage: this.intl.t('common.no-results'),
      subLabel: this.args.texts.subLabel,
      requiredLabel: this.args.texts.requiredLabel,
    };
  }

  <template>
    <PixSelect
      @id={{@id}}
      @inlineLabel={{@inlineLabel}}
      @size={{@size}}
      @texts={{this.texts}}
      @isSearchable={{true}}
      @onSearch={{this.onSearch}}
      @value={{@value}}
      @options={{this.availableOptions}}
      @onChange={{@onChange}}
      @isDisabled={{@isDisabled}}
      @aria-required={{@aria-required}}
      @errorMessage={{@errorMessage}}
      @validationStatus={{@validationStatus}}
      @hideDefaultOption={{@hideDefaultOption}}
      @isFullWidth={{@isFullWidth}}
      ...attributes
    >
      <:label>
        {{yield to="label"}}
      </:label>

      <:default as |option|>
        {{option.label}}
      </:default>
    </PixSelect>
  </template>
}
