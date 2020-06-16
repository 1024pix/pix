import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class DissociateUserModal extends Component {

  @service store;

  @action
  async dissociateUser() {
    const adapter = this.store.adapterFor('student');
    await adapter.dissociateUser(this.args.student);
    this.args.close();
    this.args.refreshModel();
  }
}
