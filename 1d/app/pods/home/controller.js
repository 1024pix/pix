import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';

export default class Home extends Controller {
  @service router;
  @tracked organizationCode;

  @action
  goToOrganization() {
    this.router.transitionTo('organization', this.organizationCode);
  }
}
