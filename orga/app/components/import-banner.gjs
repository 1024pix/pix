import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';

const statusI18nLabel = {
  STARTED: 'upload-in-progress',
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
      date: updatedAt.toLocaleDateString(),
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
    const status = this.args.organizationImportDetail?.status || 'STARTED';
    const title = this.intl.t(`pages.organization-participants-import.banner.${statusI18nLabel[status]}`);
    return title;
  }

  get anchorMessage() {
    if (this.args.organizationImportDetail?.hasError) {
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
      date: createdAt.toLocaleDateString(),
    });
  }

  get actionMessage() {
    if (this.args.organizationImportDetail?.hasError)
      return this.intl.t('pages.organization-participants-import.banner.error-text');
    return this.intl.t('pages.organization-participants-import.banner.in-progress-text');
  }

  <template>
    {{#if this.displaySuccess}}
      <p class="import-banner--success">
        <FaIcon @icon="circle-check" class="import-banner__icon" />
        {{this.successBanner}}
      </p>
    {{/if}}
    {{#if this.displayBanner}}
      <PixMessage @type={{this.bannerType}} @withIcon="true">
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
      </PixMessage>
    {{/if}}
  </template>
}
