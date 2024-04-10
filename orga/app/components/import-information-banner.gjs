import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class ImportBanner extends Component {
  @service intl;
  @service dayjs;

  get displayBanner() {
    if (!this.args.importDetail) {
      return false;
    }
    return this.dayjs.self().diff(this.args.importDetail.updatedAt, 'day') < 15;
  }

  get bannerType() {
    if (this.args.importDetail?.hasError) {
      return 'error';
    } else if (this.args.importDetail?.isDone) {
      return 'success';
    }
    return 'information';
  }

  get message() {
    if (this.args.importDetail?.hasError) {
      return this.intl.t('components.import-information-banner.error');
    } else if (this.args.importDetail?.isDone) {
      return this.intl.t('components.import-information-banner.success');
    }
    if (this.args.importDetail?.inProgress) {
      return this.intl.t('components.import-information-banner.in-progress');
    }
    return null;
  }

  get linkMessage() {
    if (this.args.importDetail?.inProgress) {
      return this.intl.t('components.import-information-banner.in-progress-link');
    }
    if (this.args.importDetail?.hasError) {
      return this.intl.t('components.import-information-banner.error-link');
    }
    return null;
  }

  <template>
    {{#if this.displayBanner}}
      <PixMessage class="import-information-banner" @type={{this.bannerType}} @withIcon="true">
        <strong>{{this.message}}</strong>
        {{#if this.linkMessage}}
          <LinkTo @route="authenticated.import-organization-participants" class="import-information-banner__link link">
            {{this.linkMessage}}
          </LinkTo>
        {{/if}}
      </PixMessage>
    {{/if}}
  </template>
}
