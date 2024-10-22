import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';

import AdministrationBlockLayout from '../block-layout';

export default class ScoWhitelistConfiguration extends Component {
  @service intl;
  @service session;
  @service notifications;

  @action
  async importScoWhitelist(files) {
    this.notifications.clearAll();
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
        this.notifications.success(this.intl.t('pages.administration.certification.sco-whitelist.import.success'));
      } else if (response.status === 422) {
        this.notifications.error(this.intl.t('pages.administration.certification.sco-whitelist.import.unprocessable'));
      } else {
        this.notifications.error(this.intl.t('pages.administration.certification.sco-whitelist.import.error'));
      }
    } catch (error) {
      this.notifications.error(this.intl.t('pages.administration.certification.sco-whitelist.import.error'));
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <AdministrationBlockLayout @title={{t "pages.administration.certification.sco-whitelist.title"}}>
      <PixMessage @type="warning">Feature en cours de construction</PixMessage>
      <br />
      <PixButtonUpload
        @id="sco-whitelist-file-upload"
        @onChange={{this.importScoWhitelist}}
        @variant="secondary"
        accept=".csv"
      >
        {{t "pages.administration.certification.sco-whitelist.import.button"}}
      </PixButtonUpload>
    </AdministrationBlockLayout>
  </template>
}
