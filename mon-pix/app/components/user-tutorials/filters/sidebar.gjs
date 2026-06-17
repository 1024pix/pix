import PixAccordions from '@1024pix/pix-ui/components/pix-accordions';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixSidePanel from '@1024pix/pix-ui/components/pix-side-panel';
import { A } from '@ember/array';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import sortBy from 'lodash/sortBy';
import ItemCheckbox from 'mon-pix/components/user-tutorials/filters/item-checkbox';

class Filters {
  @tracked competences = A([]);
}

export default class Sidebar extends Component {
  <template>
    <PixSidePanel
      @title={{t "pages.user-tutorials.filter"}}
      @showSidePanel={{@isVisible}}
      @onClose={{@onClose}}
      class="tutorials-filters"
    >
      <:content>
        {{#each this.sortedAreas as |area|}}
          <div class="area-border-container">
            <div class="area-border {{area.color}}"></div>
            <PixAccordions class="tutorials-filters__areas {{area.color}}">
              <:title>{{area.title}}</:title>
              <:content>
                <ul class="tutorials-filters-areas__competences">
                  {{#each area.sortedCompetences as |competence|}}
                    <ItemCheckbox
                      @type="competences"
                      @item={{competence}}
                      @handleFilterChange={{this.handleFilterChange}}
                      @currentFilters={{this.filters}}
                    />
                  {{/each}}
                </ul>
              </:content>
            </PixAccordions>
          </div>
        {{/each}}
      </:content>
      <:footer>
        <ul class="tutorials-filters__footer">
          <li>
            <PixButton
              @triggerAction={{this.handleResetFilters}}
              @size="small"
              @variant="secondary"
              aria-label={{t "pages.user-tutorials.sidebar.reset-aria-label"}}
            >
              {{t "pages.user-tutorials.sidebar.reset"}}
            </PixButton>
          </li>
          <li>
            <PixButton @size="small" @triggerAction={{fn @onSubmit this.filters}}>
              {{t "pages.user-tutorials.sidebar.see-results"}}
            </PixButton>
          </li>
        </ul>
      </:footer>
    </PixSidePanel>
  </template>
  @tracked filters = new Filters();

  get sortedAreas() {
    return sortBy(this.args.areas, 'code');
  }

  @action
  handleFilterChange(type, id) {
    if (!this.filters[type].includes(id)) {
      this.filters[type].pushObject(id);
    } else {
      this.filters[type].removeObject(id);
    }
  }

  @action
  handleResetFilters() {
    this.filters = new Filters();
  }
}
