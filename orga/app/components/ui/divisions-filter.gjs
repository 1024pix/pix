import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import { hash } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class DivisionsFilter extends Component {
  @service locale;
  @tracked isLoading;
  @tracked divisions;

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.args.model.divisions.then((divisions) => {
      this.divisions = divisions;
      this.isLoading = false;
    });
  }

  get options() {
    return this.divisions?.map(({ name }) => ({ value: name, label: name }));
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
        ...attributes
      >
        <:label>{{t "common.filters.divisions.label"}}</:label>
        <:default as |option|>{{option.label}}</:default>
      </PixMultiSelect>
    {{/if}}
  </template>
}
