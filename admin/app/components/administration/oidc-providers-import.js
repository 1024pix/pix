import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
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
}
