import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class OrganizationParticipantList extends Component {
  @tracked counter = 0;

  @action
  increment() {
    this.counter = this.counter + 1;
  }

  get show() {
    return this.counter > 0;
  }
}
