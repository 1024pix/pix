import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { getTranslatedMessageFromValidationCode } from 'pix-admin/utils/get-message-from-validation-code';

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
      const buildErrorMessageWithLocation = (errorLine, errorField, complementaryMessage) => {
        const messages = [
          `${this.intl.t('components.administration.organizations-import.notifications.errors.no-organization-created')}`,
          `${this.intl.t('components.administration.organizations-import.notifications.errors.error-location', { errorLine, errorField: `"${errorField}"` })}`,
          complementaryMessage,
        ];

        return htmlSafe(messages.join('<br>'));
      };
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
            const message = buildErrorMessageWithLocation(
              error.meta.currentLine,
              'parentOrganizationId',
              this.intl.t(
                'components.administration.organizations-import.notifications.errors.PARENT_ORGANIZATION_NOT_IN_NETWORK',
                { parentOrganizationId: error.meta.parentOrganizationId },
              ),
            );

            this.pixToast.sendErrorNotification({ message });
            break;
          }

          case 'STRUCTURE_CATEGORY_NOT_FOUND': {
            const message = buildErrorMessageWithLocation(
              error.meta.currentLine,
              'categoryId',
              this.intl.t(
                'components.administration.organizations-import.notifications.errors.STRUCTURE_CATEGORY_NOT_FOUND',
                { structureCategoryId: error.meta.structureCategoryId },
              ),
            );
            this.pixToast.sendErrorNotification({ message });
            break;
          }

          case 'VALIDATION_ERROR': {
            const firstInvalidAttribute = error.meta.invalidAttributes[0];

            const validationErrorMessage = getTranslatedMessageFromValidationCode(
              this.intl,
              firstInvalidAttribute.validationCode,
            );

            const message = buildErrorMessageWithLocation(
              error.meta.currentLine,
              firstInvalidAttribute.attribute,
              validationErrorMessage,
            );
            this.pixToast.sendErrorNotification({ message });
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
