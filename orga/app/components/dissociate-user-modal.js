import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class DissociateUserModal extends Component {
  @service notifications;
  @service store;

  @action
  async dissociateUser() {
    const adapter = this.store.adapterFor('student');

    try {
      await adapter.dissociateUser(this.args.student);
      this.notifications.sendSuccess(`La dissociation du compte de l’élève ${this.args.student.lastName} ${this.args.student.firstName} est réussie.`);
    } catch (e) {
      this.notifications.sendError(`La dissociation du compte de l’élève ${this.args.student.lastName} ${this.args.student.firstName} a échoué. Veuillez réessayer.`);
    }

    this.args.close();
    this.args.refreshModel();
  }
}
