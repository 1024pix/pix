import { PixButtonUpload } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';

import AdministrationBlockLayout from '../block-layout';
import DownloadTemplate from '../download-template';

export default class OrganizationsBatchArchive extends Component {
  @service intl;
  @service pixToast;
  @service requestManager;
  @service router;
  @service store;

  @action
  async archiveOrganizations(files) {
    if (!files || files.length === 0) {
      return;
    }

    const formData = new FormData();
    formData.append('file', files[0]);
    const numberOfDataLines = await _getCsvDataLinesCount(files);

    try {
      await this.requestManager.request({
        url: `${ENV.APP.API_HOST}/api/admin/organizations/batch-archive`,
        method: 'POST',
        body: formData,
      });

      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.administration.organizations-batch-archive.notifications.success', {
          count: numberOfDataLines,
        }),
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
          case 'ARCHIVE_ORGANIZATIONS_IN_BATCH_ERROR':
            this.pixToast.sendErrorNotification({
              message: this.intl.t(
                'components.administration.organizations-batch-archive.notifications.errors.error-in-batch',
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
    }
  }

  <template>
    <AdministrationBlockLayout
      @title={{t "components.administration.organizations-batch-archive.title"}}
      @description={{t "components.administration.organizations-batch-archive.description"}}
    >
      <DownloadTemplate @url="/api/admin/organizations/batch-archive/template">

        <PixButtonUpload
          @id="organizations-file-upload"
          @onChange={{this.archiveOrganizations}}
          @variant="primary"
          accept=".csv"
        >
          {{t "components.administration.organizations-batch-archive.upload-button"}}
        </PixButtonUpload>
      </DownloadTemplate>
    </AdministrationBlockLayout>
  </template>
}

async function _getCsvDataLinesCount(files) {
  const file = files[0];

  const text = await file.text();

  const lines = text.split(/\r?\n/);

  const filtered = _filterEmptyLines(lines);

  const numberOfDataLines = filtered.length - 1;
  return numberOfDataLines;
}

function _filterEmptyLines(lines) {
  const filtered = lines.filter((line) => line.trim() !== '');
  return filtered;
}
