import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class AuthenticatedOrganizationsGetChildrenController extends Controller {
  @service accessControl;
  @service intl;
  @service notifications;
  @service store;

  @action
  async handleFormSubmitted(childOrganizationId) {
    const organizationAdapter = this.store.adapterFor('organization');
    const parentOrganizationId = this.model.organization.id;

    await organizationAdapter.attachChildOrganization({ childOrganizationId, parentOrganizationId });
    await this.model.organizations.reload();
      this.notifications.success(
        this.intl.t('pages.organization-children.notifications.success.attach-child-organization'),
      );
  }
}
