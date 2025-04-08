import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';

import AdministrationBlockLayout from '../block-layout';
import DownloadTemplate from '../download-template';

export default class AddOrganizationFeaturesInBatch extends Component {
  @service intl;
  @service pixToast;
  @service session;
  @service fileSaver;
  @service errorResponseHandler;

  @action
  async addOrganizationFeaturesInBatch(files) {
    let response;
    try {
      const fileContent = files[0];

      const token = this.session.data.authenticated.access_token;
      response = await window.fetch(`${ENV.APP.API_HOST}/api/admin/organizations/add-organization-features`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/csv',
          Accept: 'application/json',
        },
        method: 'POST',
        body: fileContent,
      });
      if (response.ok) {
        this.pixToast.sendSuccessNotification({
          message: this.intl.t('components.administration.add-organization-features-in-batch.notifications.success'),
        });
        return;
      } else {
        this.errorResponseHandler.notify(await response.json());
      }
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('common.notifications.generic-error') });
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <AdministrationBlockLayout
      @title={{t "components.administration.add-organization-features-in-batch.title"}}
      @description={{t "components.administration.add-organization-features-in-batch.description"}}
    >
      <div class="csv-import">
        <DownloadTemplate @url="/api/admin/organizations/add-organization-features/template">
          <PixButtonUpload
            @id="organizations-batch-update-file-upload"
            @onChange={{this.addOrganizationFeaturesInBatch}}
            @variant="primary"
            accept=".csv"
          >
            {{t "components.administration.add-organization-features-in-batch.upload-button"}}
          </PixButtonUpload>
        </DownloadTemplate>
      </div>
    </AdministrationBlockLayout>
  </template>
}
