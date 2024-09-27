import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import AdministrationBlockLayout from '../block-layout';

export default class UpdateOrganizationImportFormat extends Component {
  @service intl;
  @service notifications;
  @service router;
  @service store;

  @action
  async uploadOrganizationImportFile(files) {
    this.notifications.clearAll();
    const adapter = this.store.adapterFor('import-files');
    try {
      await adapter.updateOrganizationImportFormat(files);
      this.notifications.success(
        this.intl.t('components.administration.organization-import-format.notifications.success'),
      );
    } catch (errorResponse) {
      const errors = errorResponse.errors;
      if (!errors) {
        return this.notifications.error(this.intl.t('common.notifications.generic-error'));
      }

      errors.forEach((error) => {
        switch (error.code) {
          case 'MISSING_REQUIRED_FIELD_NAMES':
            this.notifications.error(`${error.meta}`, { autoClear: false });
            break;
          default:
            this.notifications.error(error.detail, { autoClear: false });
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
