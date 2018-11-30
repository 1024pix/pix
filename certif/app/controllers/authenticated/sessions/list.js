import Controller from '@ember/controller';
import { computed } from '@ember/object';

const SORTING_ORDER = ['date:desc', 'createdAt:desc'];

export default Controller.extend({
  sortingOrder: SORTING_ORDER,
  sortedSessions: computed.sort('model', 'sortingOrder'),
  hasSession: computed.notEmpty('model'),
});
