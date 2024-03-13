import Controller from '@ember/controller';

import { ROLES } from '../../../constants';

export default class ListController extends Controller {
  get roles() {
    const roles = [ROLES.SUPER_ADMIN, ROLES.CERTIF, ROLES.METIER, ROLES.SUPPORT];
    return roles.map((role) => ({ value: role, label: role }));
  }
}
