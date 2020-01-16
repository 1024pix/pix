import Component from '@glimmer/component';
import { sort } from '@ember/object/computed';

const SORTING_ORDER = ['date:desc', 'time:desc'];

export default class RoutesAuthenticatedSessionsListItem extends Component {

  constructor() {
    super(...arguments);

    this.sortingOrder = SORTING_ORDER;
  }

  @sort('args.sessions', 'sortingOrder') sortedSessions;
}
