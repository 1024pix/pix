import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';

import AdministrationBlockLayout from '../block-layout';
import DownloadTemplate from '../download-template';

export default class UpdateOrganizationsInBatch extends Component {
  @service intl;
  @service pixToast;
  @service session;
  @service errorResponseHandler;

  @action
  async handleBatchUpdateError(errorResponse) {
    const error = errorResponse.errors[0];

    switch (error.code) {
      case 'ORGANIZATION_NOT_FOUND':
        return this.pixToast.sendErrorNotification({
          message: this.intl.t(
            'components.administration.update-organizations-in-batch.notifications.errors.organization-not-found',
            error.meta,
          ),
        });

      case 'DPO_EMAIL_INVALID':
        return this.pixToast.sendErrorNotification({
          message: this.intl.t(
            'components.administration.update-organizations-in-batch.notifications.errors.data-protection-email-invalid',
            error.meta,
          ),
        });

      case 'STRUCTURE_CATEGORY_NOT_FOUND':
        return this.pixToast.sendErrorNotification({
          message: this.intl.t(
            'components.administration.update-organizations-in-batch.notifications.errors.category-not-found',
            { categoryId: error.meta.categoryId },
          ),
        });

      case 'ORGANIZATION_BATCH_UPDATE_ERROR':
        return this.pixToast.sendErrorNotification({
          message: this.intl.t(
            'components.administration.update-organizations-in-batch.notifications.errors.organization-batch-update-error',
            error.meta,
          ),
        });

      default:
        this.errorResponseHandler.notify(errorResponse);
    }
  }
  @action
  async updateOrganizationsInBatch(files) {
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
        this.pixToast.sendSuccessNotification({
          message: this.intl.t('components.administration.update-organizations-in-batch.notifications.success'),
        });
        return;
      } else {
        const errorResponse = await response.json();

        await this.handleBatchUpdateError(errorResponse);
      }
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('common.notifications.generic-error') });
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <AdministrationBlockLayout
      @title={{t "components.administration.update-organizations-in-batch.title"}}
      @description={{t "components.administration.update-organizations-in-batch.description"}}
    >
      <DownloadTemplate @url="/api/admin/organizations/update-organizations/template">
        <PixButtonUpload
          @id="update-organizations-in-batch-file-upload"
          @onChange={{this.updateOrganizationsInBatch}}
          @variant="primary"
          accept=".csv"
        >
          {{t "components.administration.update-organizations-in-batch.upload-button"}}
        </PixButtonUpload>
      </DownloadTemplate>
    </AdministrationBlockLayout>
  </template>
}
