import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class ListController extends Controller {
  get roles() {
    const roles = ['SUPER_ADMIN', 'CERTIF', 'METIER', 'SUPPORT'];
    return roles.map((role) => ({ value: role, label: role }));
  }

  @action
  refresh() {
    this.send('refreshModel');
  }
}
