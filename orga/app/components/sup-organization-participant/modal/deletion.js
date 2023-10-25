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

  get text() {
    if (this.isMultipleDeletion) {
      return {
        title: this.intl.t('pages.sup-organization-participants.deletion-modal.many-items.title', {
          count: this.args.itemsToDelete.length,
          htmlSafe: true,
        }),
        content: this.intl.t('pages.sup-organization-participants.deletion-modal.many-items.content', {
          htmlSafe: true,
        }),
      };
    }
    return {
      title: this.intl.t('pages.sup-organization-participants.deletion-modal.one-item.title', {
        firstname: this.args.itemsToDelete[0].firstName,
        lastname: this.args.itemsToDelete[0].lastName,
        htmlSafe: true,
      }),
      content: this.intl.t('pages.sup-organization-participants.deletion-modal.one-item.content', { htmlSafe: true }),
    };
  }

  @action
  giveDeletionPermission() {
    this.allowDeletion = !this.allowDeletion;
  }
}
