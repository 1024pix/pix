import Controller from '@ember/controller';

export default class ListController extends Controller {
  get roles() {
    const roles = ['SUPER_ADMIN', 'CERTIF', 'METIER', 'SUPPORT'];
    return roles.map((role) => ({ value: role, label: role }));
  }
}
