import Component from '@ember/component';
import { computed } from '@ember/object';

const SORTING_ORDER = ['date:desc', 'time:desc'];

export default Component.extend({
  sortingOrder: SORTING_ORDER,
  sortedSessions: computed.sort('sessions', 'sortingOrder'),
});
