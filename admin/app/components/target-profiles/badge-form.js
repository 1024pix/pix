import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class BadgeForm extends Component {

  @service notifications;
  @service store;

  badge = {};

  constructor() {
    super(...arguments);
  }

  @action
  createBadge(event) {
    event.preventDefault();
    const result = this.store.createRecord('badge', this.badge);
    result.save({ adapterOptions: { targetProfileId: this.args.targetProfileId } });
  }
}
