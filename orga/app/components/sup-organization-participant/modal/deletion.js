import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class Deletion extends Component {
  @service intl;
  @tracked allowDeletion = false;

  get isMultipleDeletion() {
    return this.args.itemsToDelete.length > 1;
  }

  get canDelete() {
    if (!this.isMultipleDeletion) {
      return true;
    }
    return this.allowDeletion;
  }

  get count() {
    return this.args.itemsToDelete.length;
  }

  get firstName() {
    return this.args.itemsToDelete[0].firstName;
  }

  get lastName() {
    return this.args.itemsToDelete[0].lastName;
  }

  @action
  giveDeletionPermission() {
    this.allowDeletion = !this.allowDeletion;
  }
}
