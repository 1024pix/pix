import { PixButtonUpload } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import AdministrationBlockLayout from '../block-layout';
import DownloadTemplate from '../download-template';

export default class CertificationCentersBatchArchive extends Component {
  @service intl;
  @service pixToast;
  @service router;
  @service store;

  @action
  async archiveCertificationCenters(files) {
    const adapter = this.store.adapterFor('certification-centers-batch-archive');
    try {
      await adapter.archiveCertificationCenters(files);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.administration.certification-centers-batch-archive.notifications.success'),
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
          case 'ARCHIVE_CERTIFICATION_CENTERS_IN_BATCH_ERROR':
            this.pixToast.sendErrorNotification({
              message: this.intl.t(
                'components.administration.certification-centers-batch-archive.notifications.errors.error-in-batch',
                {
                  currentLine: error.meta.currentLine,
                  totalLines: error.meta.totalLines,
                },
              ),
            });
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
      @title={{t "components.administration.certification-centers-batch-archive.title"}}
      @description={{t "components.administration.certification-centers-batch-archive.description"}}
    >
      <DownloadTemplate @url="/api/admin/certification-centers/batch-archive/template">
        <PixButtonUpload
          @id="archive-certification-centers-file-upload"
          @onChange={{this.archiveCertificationCenters}}
          @variant="primary"
          accept=".csv"
        >
          {{t "components.administration.certification-centers-batch-archive.upload-button"}}
        </PixButtonUpload>
      </DownloadTemplate>
    </AdministrationBlockLayout>
  </template>
}
