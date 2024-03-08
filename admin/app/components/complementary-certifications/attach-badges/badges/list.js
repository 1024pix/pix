import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class List extends Component {
  @action
  onBadgeUpdated(badgeId, event) {
    this.args.onBadgeUpdated({
      badgeId,
      fieldName: event.target.name,
      fieldValue: event.target.value,
    });
  }
}
