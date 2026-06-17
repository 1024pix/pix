import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class CertificationFrameworkItem extends Controller {
  @service router;
  @service currentUser;

  @action
  refresh() {
    this.send('refreshModel');
  }
}
