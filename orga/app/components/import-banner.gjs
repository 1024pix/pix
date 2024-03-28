import { service } from '@ember/service';
import Component from '@glimmer/component';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import PixMessage from '@1024pix/pix-ui/components/pix-message';

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
  @service currentUser;
  @service session;
  @service errorMessages;
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
    return this.args.isLoading || this.args.organizationImportDetail?.hasWarning;
  }

  get bannerType() {
    if (this.args.organizationImportDetail?.hasWarning) {
      return 'warning';
    } else {
      return 'information';
    }
  }

  get bannerMessage() {
    //const status = this.args.organizationImportDetail?.status;
    //const title = this.intl.t(`pages.organization-participants-import.banner.${statusI18nLabel[status]}`);

    if (this.args.organizationImportDetail?.hasWarning) {
      return this.intl.t('pages.organization-participants-import.banner.warning-banner', { htmlSafe: true });
    }
    return this.intl.t('pages.organization-participants-import.banner.upload-in-progress');
  }

  <template>
    {{#if this.displaySuccess}}
    <p class="success-import-banner">
      <FaIcon @icon="circle-check" class="success-import-banner__icon" />
      {{this.successBanner}}
    </p>
  {{/if}}
  {{#if this.displayBanner}}
    <PixMessage @type={{this.bannerType}} @withIcon="true">
      {{this.bannerMessage}}
    </PixMessage>
  {{/if}}
  </template>
}
