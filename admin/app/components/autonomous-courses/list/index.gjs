import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { isSearchValid } from 'pix-admin/utils/normalize-text.js';

import ListItem from './item';

export default class AutonomousCoursesList extends Component {
  @tracked items;

  get filteredItems() {
    return this.items || this.args.items;
  }

  @action
  triggerFiltering(key, event) {
    const valueToSearch = event.target.value;

    this.items = this.args.items.filter((item) => !valueToSearch || isSearchValid(item[key], valueToSearch));
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
