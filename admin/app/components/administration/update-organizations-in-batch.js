import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pix-admin/config/environment';

export default class UpdateOrganizationsInBatch extends Component {
  @service intl;
  @service notifications;
  @service session;
  @service errorResponseHandler;

  @action
  async updateOrganizationsInBatch(files) {
    this.notifications.clearAll();

    let response;

    try {
      const token = this.session.data.authenticated.access_token;

      response = await window.fetch(`${ENV.APP.API_HOST}/api/admin/organizations/update-organizations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/csv',
          Accept: 'application/json',
        },
        method: 'POST',
        body: files[0],
      });

      if (response.ok) {
        this.notifications.success(
          this.intl.t('components.administration.update-organizations-in-batch.notifications.success'),
        );
        return;
      } else {
        const json = await response.json();
        const error = json.errors[0];

        if (error.code === 'ORGANIZATION_NOT_FOUND') {
          return this.notifications.error(
            this.intl.t(
              'components.administration.update-organizations-in-batch.notifications.errors.organization-not-found',
              error.meta,
            ),
          );
        } else if (error.code === 'UNABLE_TO_ATTACH_CHILD_ORGANIZATION_TO_PARENT_ORGANIZATION') {
          return this.notifications.error(
            this.intl.t(
              'components.administration.update-organizations-in-batch.notifications.errors.parent-organization-not-found',
              error.meta,
            ),
          );
        } else if (error.code === 'DPO_EMAIL_INVALID') {
          return this.notifications.error(
            this.intl.t(
              'components.administration.update-organizations-in-batch.notifications.errors.data-protection-email-invalid',
              error.meta,
            ),
          );
        } else if (error.code === 'ORGANIZATION_BATCH_UPDATE_ERROR') {
          return this.notifications.error(
            this.intl.t(
              'components.administration.update-organizations-in-batch.notifications.errors.organization-batch-update-error',
              error.meta,
            ),
          );
        }
      }

      this.errorResponseHandler.notify(await response.json());
    } catch (error) {
      this.notifications.error(this.intl.t('common.notifications.generic-error'), { autoClear: false });
    } finally {
      this.isLoading = false;
    }
  }
}
