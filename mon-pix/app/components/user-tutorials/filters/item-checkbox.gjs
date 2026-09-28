import { PixCheckbox } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';

export default class ItemCheckbox extends Component {
  <template>
    <li class="tutorials-filters-areas-competences__item-checkbox">
      <PixCheckbox @id={{@item.id}} {{on "input" (fn @handleFilterChange @type @item.id)}} @checked={{this.isChecked}}>
        <:label>
          {{@item.name}}
        </:label>
      </PixCheckbox>
    </li>
  </template>
  constructor() {
    super(...arguments);

    if (!this.args.type) {
      throw new Error('ERROR in UserTutorials::Filters::ItemCheckbox component, you must provide @type params');
    }
  }

  get isChecked() {
    return this.args.currentFilters[this.args.type].includes(this.args.item.id);
  }
}
