import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import AdministrationBlockLayout from '../block-layout';

export default class OrganizationsBatchArchive extends Component {
  @service intl;
  @service pixToast;
  @service router;
  @service store;

  @action
  async archiveOrganizations(files) {
    const adapter = this.store.adapterFor('organization');
    try {
      await adapter.archiveOrganizations(files);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.administration.organizations-batch-archive.notifications.success'),
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
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <AdministrationBlockLayout
      @title={{t "components.administration.organizations-batch-archive.title"}}
      @description={{t "components.administration.organizations-batch-archive.description"}}
    >
      <PixButtonUpload
        @id="organizations-file-upload"
        @onChange={{this.archiveOrganizations}}
        @variant="secondary"
        accept=".csv"
      >
        {{t "components.administration.organizations-batch-archive.upload-button"}}
      </PixButtonUpload>
    </AdministrationBlockLayout>
  </template>
}
