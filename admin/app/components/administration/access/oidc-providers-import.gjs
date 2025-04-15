import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';

import AdministrationBlockLayout from '../block-layout';

export default class OidcProvidersImport extends Component {
  @service intl;
  @service pixToast;
  @service session;

  @action
  async importOidcProviders(files) {
    let response;
    try {
      const fileContent = files[0];

      const token = this.session.data.authenticated.access_token;
      response = await fetch(`${ENV.APP.API_HOST}/api/admin/oidc-providers/import`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: fileContent,
      });
      if (response.ok) {
        this.pixToast.sendSuccessNotification({
          message: this.intl.t('components.administration.oidc-providers-import.notifications.success'),
        });
        return;
      }

      const jsonResponse = await response.json();
      if (!jsonResponse.errors) {
        throw new Error('Generic error');
      }

      jsonResponse.errors.forEach((error) => {
        this.pixToast.sendErrorNotification({ message: error.detail });
      });
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('common.notifications.generic-error') });
    } finally {
      this.isLoading = false;
    }
  }
  <template>
    <AdministrationBlockLayout
      @title={{t "components.administration.oidc-providers-import.title"}}
      @description={{t "components.administration.oidc-providers-import.description"}}
    >
      <PixButtonUpload
        @id="oidc-providers-file-upload"
        @onChange={{this.importOidcProviders}}
        @variant="secondary"
        accept=".json"
      >
        {{t "components.administration.oidc-providers-import.upload-button"}}
      </PixButtonUpload>
    </AdministrationBlockLayout>
  </template>
}
