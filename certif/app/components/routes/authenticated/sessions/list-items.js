import { sort } from '@ember/object/computed';
import Component from '@ember/component';

const SORTING_ORDER = ['date:desc', 'time:desc'];

export default Component.extend({
  sortingOrder: SORTING_ORDER,
  sortedSessions: sort('sessions', 'sortingOrder'),
});
