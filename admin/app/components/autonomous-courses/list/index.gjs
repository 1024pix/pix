import { PixFilterBanner, PixInput, PixTable } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import ListItem from './item';

export default class AutonomousCoursesList extends Component {
  @tracked items;

  get filteredItems() {
    return this.items || this.args.items;
  }

  @action
  triggerFiltering(key, event) {
    const normalizeText = (text) =>
      text
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const valueToSearch = normalizeText(event.target.value);

    this.items = this.args.items.filter((item) => !valueToSearch || normalizeText(item[key]).includes(valueToSearch));
  }

  <template>
    <div class="page-with-table">
      <PixFilterBanner @title={{t "common.filters.title"}}>
        <PixInput oninput={{fn this.triggerFiltering "id"}} aria-label="Filtrer par ID">
          <:label>{{t "components.autonomous-courses.list.headers.id"}}</:label>
        </PixInput>
        <PixInput oninput={{fn this.triggerFiltering "name"}} aria-label="Filtrer par nom">
          <:label>{{t "components.autonomous-courses.list.headers.name"}}</:label>
        </PixInput>
      </PixFilterBanner>

      {{#if @items}}
        <PixTable
          @variant="admin"
          @data={{this.filteredItems}}
          @caption={{t "components.autonomous-courses.list.title"}}
        >
          <:columns as |autonomousCourseListItem context|>
            <ListItem @item={{autonomousCourseListItem}} @context={{context}} />
          </:columns>
        </PixTable>
      {{else}}
        <div class="table__empty">{{t "components.autonomous-courses.list.no-result"}}</div>
      {{/if}}
    </div>
  </template>
}
