import Controller from '@ember/controller';
import { computed } from '@ember/object';

const SORTING_ORDER = ['date:desc', 'time:desc'];

export default Controller.extend({
  sortingOrder: SORTING_ORDER,
  sortedSessions: computed.sort('model', 'sortingOrder'),
  hasSession: computed.notEmpty('model'),
});
