import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import AdministrationBlockLayout from '../block-layout';
import DownloadTemplate from '../download-template';

export default class CampaignsImport extends Component {
  @service intl;
  @service pixToast;
  @service router;
  @service store;

  @action
  async importCampaigns(files) {
    const adapter = this.store.adapterFor('import-files');
    try {
      await adapter.addCampaignsCsv(files);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.administration.campaigns-import.notifications.success'),
      });
    } catch (errorResponse) {
      const errors = errorResponse.errors;

      if (!errors) {
        return this.pixToast.sendErrorNotification({ message: this.intl.t('common.notifications.generic-error') });
      }
      errors.forEach((error) => {
        switch (error.code) {
          case 'MISSING_REQUIRED_FIELD_NAMES':
            this.pixToast.sendErrorNotification({ message: `${error.meta}` });
            break;
          default:
            this.pixToast.sendErrorNotification({ message: error.detail });
        }
      });
    } finally {
      this.isLoading = false;
    }
  }
  <template>
    <AdministrationBlockLayout
      @title={{t "components.administration.campaigns-import.title"}}
      @description={{t "components.administration.campaigns-import.description"}}
    >
      <DownloadTemplate @url="/api/admin/campaigns/template">
        <PixButtonUpload
          @id="campaigns-file-upload"
          @onChange={{this.importCampaigns}}
          @variant="primary"
          accept=".csv"
        >
          {{t "components.administration.campaigns-import.upload-button"}}
        </PixButtonUpload>
      </DownloadTemplate>
    </AdministrationBlockLayout>
  </template>
}
