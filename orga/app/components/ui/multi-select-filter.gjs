import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

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
        @texts={{hash
          placeholder=@placeholder
          emptySearchMessage=@emptyMessage
          searchLabel=(t "common.filters.search-label-list")
        }}
        @screenReaderOnly={{true}}
        @isSearchable={{true}}
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
