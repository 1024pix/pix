import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import get from 'lodash/get';

export default class AuthenticatedOrganizationsGetChildrenController extends Controller {
  @service accessControl;
  @service intl;
  @service notifications;
  @service store;

  @action
  async handleFormSubmitted(childOrganizationId) {
    const organizationAdapter = this.store.adapterFor('organization');
    const parentOrganizationId = this.model.organization.id;

    try {
      await organizationAdapter.attachChildOrganization({ childOrganizationId, parentOrganizationId });
      this.notifications.success(
        this.intl.t('pages.organization-children.notifications.success.attach-child-organization'),
      );

      await this.model.organization.hasMany('children').reload();
    } catch (responseError) {
      const error = get(responseError, 'errors[0]');
      let message;
      switch (error?.code) {
        case 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_ITSELF':
          message = this.intl.t(
            'pages.organization-children.notifications.error.unable-to-attach-child-organization-to-itself',
          );
          break;
        case 'UNABLE_TO_ATTACH_ALREADY_ATTACHED_CHILD_ORGANIZATION':
          message = this.intl.t(
            'pages.organization-children.notifications.error.unable-to-attach-already-attached-child-organization',
          );
          break;
        case 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_ANOTHER_CHILD_ORGANIZATION':
          message = this.intl.t(
            'pages.organization-children.notifications.error.unable-to-attach-child-organization-to-another-child-organization',
          );
          break;
        case 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_WITHOUT_SAME_TYPE':
          message = this.intl.t(
            'pages.organization-children.notifications.error.unable-to-attach-child-organization-without-same-type',
          );
          break;
        case 'UNABLE_TO_ATTACH_PARENT_ORGANIZATION_AS_CHILD_ORGANIZATION':
          message = this.intl.t(
            'pages.organization-children.notifications.error.unable-to-attach-parent-organization-as-child-organization',
          );
          break;
        default:
          message = this.intl.t('common.notifications.generic-error');
      }

      this.notifications.error(message);
    }
  }
}
