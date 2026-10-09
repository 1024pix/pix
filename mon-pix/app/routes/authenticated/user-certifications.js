import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class UserCertificationsRoute extends Route {
  @service router;

  redirect() {
    return this.router.replaceWith('authenticated.certifications');
  }
}
