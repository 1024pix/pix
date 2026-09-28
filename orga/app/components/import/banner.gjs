import { PixIcon, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';

const statusI18nLabel = {
  UPLOADING: 'upload-in-progress',
  UPLOADED: 'validation-in-progress',
  UPLOAD_ERROR: 'upload-error',
  VALIDATED: 'import-in-progress',
  VALIDATION_ERROR: 'validation-error',
  IMPORT_ERROR: 'import-error',
  IMPORTED: 'global-success',
};
export default class ImportBanner extends Component {
  @service intl;

  get displaySuccess() {
    return this.args.organizationImportDetail?.isDone;
  }

  get successBanner() {
    const {
      updatedAt,
      createdBy: { firstName, lastName },
    } = this.args.organizationImportDetail;
    return this.intl.t('pages.organization-participants-import.global-success', {
      date: this.intl.formatDate(updatedAt, { format: 'LLL' }),
      firstName,
      lastName,
    });
  }

  get displayBanner() {
    return Boolean(
      this.args.isLoading ||
      this.args.organizationImportDetail?.inProgress ||
      this.args.organizationImportDetail?.hasError ||
      this.args.organizationImportDetail?.hasWarning,
    );
  }

  get bannerType() {
    if (this.args.organizationImportDetail?.hasError) {
      return 'error';
    }
    if (this.args.organizationImportDetail?.hasWarning) {
      return 'warning';
    } else {
      return 'information';
    }
  }

  get bannerMessage() {
    if (this.args.organizationImportDetail?.hasWarning) {
      return this.intl.t('pages.organization-participants-import.banner.warning-banner', { htmlSafe: true });
    }

    const status = this.args.isLoading ? 'UPLOADING' : this.args.organizationImportDetail?.status;

    const title = this.intl.t(`pages.organization-participants-import.banner.${statusI18nLabel[status]}`);
    return title;
  }

  get anchorMessage() {
    if (this.args.organizationImportDetail?.hasFixableErrors) {
      return this.intl.t('pages.organization-participants-import.banner.anchor-error');
    }
    return null;
  }

  get displayMessage() {
    return this.args.organizationImportDetail?.hasError || this.args.organizationImportDetail?.inProgress;
  }

  get infoMessage() {
    const {
      createdAt,
      createdBy: { firstName, lastName },
    } = this.args.organizationImportDetail;
    return this.intl.t('pages.organization-participants-import.banner.upload-completed', {
      firstName,
      lastName,
      date: this.intl.formatDate(createdAt, { format: 'LLL' }),
    });
  }

  get actionMessage() {
    if (this.args.organizationImportDetail?.hasError)
      if (this.args.organizationImportDetail?.hasFixableErrors)
        return this.intl.t('pages.organization-participants-import.banner.fix-error-text');
      else return this.intl.t('pages.organization-participants-import.banner.retry-error-text');
    return this.intl.t('pages.organization-participants-import.banner.in-progress-text');
  }

  <template>
    {{#if this.displaySuccess}}
      <p class="import-banner--success">
        <PixIcon @name="checkCircle" @plainIcon={{true}} class="import-banner__icon" />
        {{this.successBanner}}
      </p>
    {{/if}}
    {{#if this.displayBanner}}
      <PixNotificationAlert @type={{this.bannerType}} @withIcon="true">
        <strong class="import-banner__title">{{this.bannerMessage}}</strong>
        {{#if this.anchorMessage}}
          (<a class="import-banner__link" href="#{{@errorPanelId}}">{{this.anchorMessage}}</a>)
        {{/if}}
        {{#if this.displayMessage}}
          <span class="import-banner__message">
            {{this.infoMessage}}
            <br />
            {{this.actionMessage}}
          </span>
        {{/if}}
      </PixNotificationAlert>
    {{/if}}
  </template>
}
