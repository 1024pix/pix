import { sort, notEmpty } from '@ember/object/computed';
import Controller from '@ember/controller';

const SORTING_ORDER = ['name:asc', 'createdAt:desc'];

export default Controller.extend({
  sortingOrder: SORTING_ORDER,
  sortedCampaigns: sort('model', 'sortingOrder'),
  hasCampaign: notEmpty('model'),
});
