import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-admin/config/environment';

export default class AnonymizeGarImport extends Component {
  @service intl;
  @service notifications;
  @service session;

  @tracked isLoading = false;

  @action
  async anonymizeGar(files) {
    this.isLoading = true;
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
        const { 'gar-anonymized-user-count': garAnonymizedUserCount, total } = json.data.attributes;

        if (garAnonymizedUserCount === total) {
          return this.notifications.success(
            this.intl.t('components.administration.anonymize-gar-import.notifications.success.full', { total }),
          );
        }

        return this.notifications.warning(
          this.intl.t('components.administration.anonymize-gar-import.notifications.success.partial', {
            garAnonymizedUserCount,
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
    } finally {
      this.isLoading = false;
    }
  }
}
