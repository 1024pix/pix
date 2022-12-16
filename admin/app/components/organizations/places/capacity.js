import Component from '@glimmer/component';

const categories = {
  FREE_RATE: 'Tarif gratuit',
  PUBLIC_RATE: 'Tarif public',
  REDUCE_RATE: 'Tarif réduit',
  SPECIAL_REDUCE_RATE: 'Tarif réduit spécial',
  FULL_RATE: 'Tarif plein',
};

export default class Capacity extends Component {
  get placesCapacityCategories() {
    return this.args.placesCapacity?.categories
      .filter(({ count }) => count > 0)
      .map(({ category, count }) => ({
        label: categories[category],
        count,
      }));
  }
}
