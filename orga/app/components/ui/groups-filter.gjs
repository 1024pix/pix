import { PixMultiSelect } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class GroupsFilter extends Component {
  @service locale;
  @tracked isLoading;
  @tracked groups;

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.args.campaign.groups.then((groups) => {
      this.groups = groups;
      this.isLoading = false;
    });
  }

  get options() {
    return this.groups?.map(({ name }) => ({ value: name, label: name }));
  }

  <template>
    {{#if this.isLoading}}
      <div class="groups-filter--is-loading placeholder-box"></div>
    {{else}}
      <PixMultiSelect
        @placeholder={{t "common.filters.groups.placeholder"}}
        @emptyMessage={{t "common.filters.groups.empty"}}
        @screenReaderOnly={{true}}
        @isSearchable={{true}}
        @locale={{this.locale.currentLocale}}
        @onChange={{@onSelect}}
        @values={{@selectedGroups}}
        @options={{this.options}}
        ...attributes
      >
        <:default as |option|>{{option.label}}</:default>
        <:label>{{t "common.filters.groups.label"}}</:label>
      </PixMultiSelect>
    {{/if}}
  </template>
}
