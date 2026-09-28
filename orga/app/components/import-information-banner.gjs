import { PixNotificationAlert } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';

export default class ImportBanner extends Component {
  @service intl;

  get displayBanner() {
    if (!this.args.importDetail) {
      return false;
    }
    return dayjs().diff(this.args.importDetail.updatedAt, 'day') < 15;
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
      const {
        updatedAt,
        createdBy: { firstName, lastName },
      } = this.args.importDetail;
      return this.intl.t('components.import-information-banner.success', {
        date: dayjs(updatedAt).format('D MMM YYYY'),
        firstname: firstName,
        lastname: lastName,
      });
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
      <PixNotificationAlert class="import-information-banner" @type={{this.bannerType}} @withIcon="true">
        <strong>{{this.message}}</strong>
        {{#if this.linkMessage}}
          <LinkTo @route="authenticated.import-organization-participants" class="import-information-banner__link link">
            {{this.linkMessage}}
          </LinkTo>
        {{/if}}
      </PixNotificationAlert>
    {{/if}}
  </template>
}
