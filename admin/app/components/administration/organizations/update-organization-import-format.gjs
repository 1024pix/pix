import { PixButtonUpload } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import AdministrationBlockLayout from '../block-layout';

export default class UpdateOrganizationImportFormat extends Component {
  @service intl;
  @service pixToast;
  @service router;
  @service store;

  @action
  async uploadOrganizationImportFile(files) {
    const adapter = this.store.adapterFor('import-files');
    try {
      await adapter.updateOrganizationImportFormat(files);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.administration.organization-import-format.notifications.success'),
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
      @title={{t "components.administration.organization-import-format.title"}}
      @description={{t "components.administration.organization-import-format.description"}}
    >
      <PixButtonUpload
        @id="organization-import-file-upload"
        @onChange={{this.uploadOrganizationImportFile}}
        accept=".json"
      >
        {{t "components.administration.organization-import-format.upload-button"}}
      </PixButtonUpload>
    </AdministrationBlockLayout>
  </template>
}
