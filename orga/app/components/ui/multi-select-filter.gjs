import { PixMultiSelect } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class MultiSelectFilter extends Component {
  @service locale;

  @action
  onSelect(value) {
    const { onSelect, field } = this.args;
    onSelect(field, value);
  }

  <template>
    {{#if @isLoading}}
      <div class="multi-select-filter--is-loading placeholder-box"></div>
    {{else}}
      <PixMultiSelect
        @placeholder={{@placeholder}}
        @screenReaderOnly={{true}}
        @emptyMessage={{@emptyMessage}}
        @isSearchable={{true}}
        @locale={{this.locale.currentLocale}}
        @onChange={{this.onSelect}}
        @values={{@selectedOption}}
        @options={{@options}}
      >
        <:label>{{@label}}</:label>
        <:default as |option|>{{option.label}}</:default>
      </PixMultiSelect>
    {{/if}}
  </template>
}
