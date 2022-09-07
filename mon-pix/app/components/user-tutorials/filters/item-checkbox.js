import Component from '@glimmer/component';

export default class ItemCheckbox extends Component {
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
