import { PixButtonUpload } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import AdministrationBlockLayout from '../block-layout';
import DownloadTemplate from '../download-template';

export default class OrganizationsImport extends Component {
  @service intl;
  @service pixToast;
  @service router;
  @service store;

  @action
  async importOrganizations(files) {
    const adapter = this.store.adapterFor('organizations-import');
    try {
      const savedOrganizations = await adapter.addOrganizationsCsv(files);

      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.administration.organizations-import.notifications.success', {
          count: savedOrganizations.data.length,
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
          case 'PARENT_ORGANIZATION_NOT_IN_NETWORK': {
            const message = [
              `${this.intl.t('components.administration.organizations-import.notifications.errors.no-organization-created')}`,
              `${this.intl.t('components.administration.organizations-import.notifications.errors.error-location', { errorLine: error.meta.currentLine, errorField: '"parentOrganizationId"' })}`,
              this.intl.t(
                'components.administration.organizations-import.notifications.errors.PARENT_ORGANIZATION_NOT_IN_NETWORK',
                { parentOrganizationId: error.meta.parentOrganizationId },
              ),
            ];

            this.pixToast.sendErrorNotification({ message: htmlSafe(message.join('<br>')) });
            break;
          }
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
      @title={{t "components.administration.organizations-import.title"}}
      @description={{t "components.administration.organizations-import.description"}}
    >
      <DownloadTemplate @url="/api/admin/organizations/import-csv/template">
        <PixButtonUpload @id="orga-file-upload" @onChange={{this.importOrganizations}} @variant="primary" accept=".csv">
          {{t "components.administration.organizations-import.upload-button"}}
        </PixButtonUpload>
      </DownloadTemplate>
    </AdministrationBlockLayout>
  </template>
}
