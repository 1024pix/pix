import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';

import AdministrationBlockLayout from '../block-layout';

export default class ScoWhitelistConfiguration extends Component {
  @service intl;
  @service session;
  @service pixToast;
  @service fileSaver;

  @tracked isExportLoading = false;

  @action
  async importScoWhitelist(files) {
    try {
      const fileContent = files[0];

      const token = this.session.data.authenticated.access_token;
      const response = await window.fetch(`${ENV.APP.API_HOST}/api/admin/sco-whitelist`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/csv',
          Accept: 'application/json',
        },
        method: 'POST',
        body: fileContent,
      });
      if (response.ok) {
        this.pixToast.sendSuccessNotification({
          message: this.intl.t('pages.administration.certification.sco-whitelist.import.success'),
        });
      } else {
        const responseJson = await response.json();
        const errorKey = responseJson?.errors[0]?.code || 'error';

        this.pixToast.sendErrorNotification({
          message: this.intl.t(`pages.administration.certification.sco-whitelist.import.${errorKey}`),
        });
      }
    } catch (error) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('pages.administration.certification.sco-whitelist.import.error'),
      });
    }
  }

  @action
  async exportWhitelist() {
    try {
      this.isExportLoading = true;
      const url = `${ENV.APP.API_HOST}/api/admin/sco-whitelist`;
      const fileName = 'sco-whitelist.csv';
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url, fileName, token });
    } catch (error) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('pages.administration.certification.sco-whitelist.export.error'),
      });
    } finally {
      this.isExportLoading = false;
    }
  }

  <template>
    <AdministrationBlockLayout
      @title={{t "pages.administration.certification.sco-whitelist.title"}}
      class="sco-whitelist-configuration"
    >
      <PixNotificationAlert @type="info">{{t
          "pages.administration.certification.sco-whitelist.instructions"
        }}</PixNotificationAlert>

      <div class="sco-whitelist-configuration__actions">
        <PixButton @triggerAction={{this.exportWhitelist}} @isLoading={{this.isExportLoading}}>
          {{t "pages.administration.certification.sco-whitelist.export.button"}}
        </PixButton>
        <PixButtonUpload
          @id="sco-whitelist-file-upload"
          @onChange={{this.importScoWhitelist}}
          @variant="secondary"
          accept=".csv"
        >
          {{t "pages.administration.certification.sco-whitelist.import.button"}}
        </PixButtonUpload>
      </div>
    </AdministrationBlockLayout>
  </template>
}
