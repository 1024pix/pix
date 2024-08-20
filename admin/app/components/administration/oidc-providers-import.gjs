import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import fetch from 'fetch';
import ENV from 'pix-admin/config/environment';

export default class OidcProvidersImport extends Component {
  @service intl;
  @service notifications;
  @service session;

  @action
  async importOidcProviders(files) {
    this.notifications.clearAll();

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
        this.notifications.success(
          this.intl.t('components.administration.oidc-providers-import.notifications.success'),
        );
        return;
      }

      const jsonResponse = await response.json();
      if (!jsonResponse.errors) {
        throw new Error('Generic error');
      }

      jsonResponse.errors.forEach((error) => {
        this.notifications.error(error.detail, { autoClear: false });
      });
    } catch (error) {
      this.notifications.error(this.intl.t('common.notifications.generic-error'));
    } finally {
      this.isLoading = false;
    }
  }
  <template>
    <section class="page-section">
      <header class="page-section__header">
        <h2 class="page-section__title">{{t "components.administration.oidc-providers-import.title"}}</h2>
      </header>
      <p class="description">{{t "components.administration.oidc-providers-import.description"}}</p>
      <PixButtonUpload
        @id="oidc-providers-file-upload"
        @onChange={{this.importOidcProviders}}
        @variant="secondary"
        accept=".json"
      >
        {{t "components.administration.oidc-providers-import.upload-button"}}
      </PixButtonUpload>
    </section>
  </template>
}
