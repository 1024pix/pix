import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import get from 'lodash/get';
import ActionsSection from 'pix-admin/components/organizations/network/actions-section';
import List from 'pix-admin/components/organizations/network/list';

export default class OrganizationNetworkComponent extends Component {
  @service accessControl;
  @service pixToast;
  @service store;
  @service intl;

  @action
  refreshOrganizationChildren() {
    this.args.organization.hasMany('children').reload();
  }

  @action
  async handleAttachOrganizations(childOrganizationIds) {
    const organizationAdapter = this.store.adapterFor('organization');
    const parentOrganizationId = this.args.organization.id;

    try {
      await organizationAdapter.attachChildOrganization({ childOrganizationIds, parentOrganizationId });
      const count = childOrganizationIds.split(',').length;
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.organization-network.notifications.success.attach-child-organization', {
          count,
        }),
      });

      await this.refreshOrganizationChildren();
    } catch (responseError) {
      const error = get(responseError, 'errors[0]');
      const childOrganizationId = error.meta?.childOrganizationId;
      let message;
      switch (error?.code) {
        case 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_ITSELF':
          message = this.intl.t(
            'pages.organization-network.notifications.error.unable-to-attach-child-organization-to-itself',
            { childOrganizationId },
          );
          break;
        case 'UNABLE_TO_ATTACH_ALREADY_ATTACHED_CHILD_ORGANIZATION':
          message = this.intl.t(
            'pages.organization-network.notifications.error.unable-to-attach-already-attached-child-organization',
            { childOrganizationId },
          );
          break;
        case 'INVALID_CHILD_ORGANIZATION_IDS':
          message = this.intl.t('components.organizations.network.attach-child-form.invalid-ids-error');
          break;
        default:
          message = this.intl.t('common.notifications.generic-error');
      }

      this.pixToast.sendErrorNotification({ message });
    }
  }

  <template>
    {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
      <ActionsSection @onAttachChildSubmitForm={{this.handleAttachOrganizations}} @organization={{@organization}} />
    {{/if}}

    <section class="page-section">
      <header class="page-section__header">
        <h2 class="page-section__title">{{t "pages.organization-network.title"}}</h2>
      </header>
      {{#if @children}}
        <List @childOrganizations={{@children}} @onRefreshOrganizationChildren={{this.refreshOrganizationChildren}} />
      {{else}}
        <p class="table__empty">{{t "components.organizations.network.empty-table"}}</p>
      {{/if}}
    </section>
  </template>
}
