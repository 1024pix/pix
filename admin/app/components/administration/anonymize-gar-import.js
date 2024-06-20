import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pix-admin/config/environment';

export default class AnonymizeGarImport extends Component {
  @service intl;
  @service notifications;
  @service session;

  @action
  async anonymizeGar(files) {
    this.notifications.clearAll();

    try {
      const token = this.session.data.authenticated.access_token;

      const response = await window.fetch(`${ENV.APP.API_HOST}/api/admin/anonymize/gar`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/csv',
          Accept: 'application/json',
        },
        method: 'POST',
        body: files[0],
      });

      const json = await response.json();

      if (response.ok) {
        const { anonymized, total } = json.data.attributes;

        if (anonymized === total) {
          return this.notifications.success(
            this.intl.t('components.administration.anonymize-gar-import.notifications.success.full', { anonymized }),
          );
        }

        return this.notifications.warning(
          this.intl.t('components.administration.anonymize-gar-import.notifications.success.partial', {
            anonymized,
            total,
          }),
        );
      }

      const error = json.errors[0];
      if (error.code === 'PAYLOAD_TOO_LARGE') {
        return this.notifications.error(
          this.intl.t('components.administration.anonymize-gar-import.notifications.error.payload-too-large', {
            maxSize: error.meta.maxSize,
          }),
        );
      }

      this.errorResponseHandler.notify(await response.json());
    } catch (error) {
      this.notifications.error(this.intl.t('common.notifications.generic-error'));
    }
  }
}
