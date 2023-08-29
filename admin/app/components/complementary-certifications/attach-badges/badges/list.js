import Component from '@glimmer/component';
import {action} from '@ember/object';

export default class List extends Component {
  @action
  onBadgeUpdated(badgeId, event) {
    this.args.onBadgeUpdated({
      badgeId,
      fieldName: event.target.id,
      fieldValue: event.target.value
    });
  }
}
