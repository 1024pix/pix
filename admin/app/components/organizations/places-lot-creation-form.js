import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';

const categories = [
  { value: 'FULL_RATE', label: 'Tarif plein' },
  { value: 'SPECIAL_REDUCE_RATE', label: 'Tarif réduit spécial' },
  { value: 'REDUCE_RATE', label: 'Tarif réduit' },
  { value: 'PUBLIC_RATE', label: 'Tarif public' },
  { value: 'FREE_RATE', label: 'Tarif gratuit' },
];

export default class PlacesLotCreationForm extends Component {
  @service store;
  @service notifications;
  @service router;
  @tracked selectedCategory = null;

  @tracked count;
  @tracked activationDate;
  @tracked expirationDate;
  @tracked category;
  @tracked reference;

  constructor() {
    super(...arguments);
    this.categories = categories;
    this.activationDate = dayjs(new Date()).format('YYYY-MM-DD');
  }

  @action
  async onSubmit(event) {
    event.preventDefault();

    this.args.create({
      count: this.count,
      activationDate: this.activationDate,
      expirationDate: this.expirationDate ? this.expirationDate : null,
      category: this.category,
      reference: this.reference,
    });
  }

  @action
  selectCategory(value) {
    const newValue = value || null;
    this.category = newValue;
  }

  getCategoryByValue(value) {
    if (value) {
      return find(this.categories, { value });
    }
    return this.categories[0];
  }
}
