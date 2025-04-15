import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class IndexController extends Controller {
  @service currentUser;

  get currentUserRole() {
    return this.currentUser.adminMember;
  }
}
