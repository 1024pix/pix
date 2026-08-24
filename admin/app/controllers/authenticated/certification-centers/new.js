import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class NewController extends Controller {
  @service router;

  queryParams = ['attachedOrganizationId'];

  @tracked attachedOrganizationId = null;

  @action
  redirectOnCancel() {
    if (this.attachedOrganizationId) {
      return this.router.transitionTo(
        'authenticated.organizations.get.attached-certification-centers',
        this.attachedOrganizationId,
      );
    }
    this.router.transitionTo('authenticated.certification-centers');
  }
}
