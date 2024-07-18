import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pix-admin/config/environment';

export default class OrganizationTagsImport extends Component {
  @service intl;
  @service notifications;
  @service session;
  @service errorResponseHandler;

  @action
  async importOrganizationTags(files) {
    this.notifications.clearAll();

    let response;
    try {
      const fileContent = files[0];

      const token = this.session.data.authenticated.access_token;
      response = await window.fetch(`${ENV.APP.API_HOST}/api/admin/organizations/import-tags-csv`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/csv',
          Accept: 'application/json',
        },
        method: 'POST',
        body: fileContent,
      });
      if (response.ok) {
        this.notifications.success(
          this.intl.t('components.administration.organization-tags-import.notifications.success'),
        );
        return;
      } else {
        const json = await response.json();
        const error = json.errors[0];

        if (error.code === 'TAG_NOT_FOUND') {
          this.notifications.error(
            this.intl.t(
              'components.administration.organization-tags-import.notifications.errors.tag-not-found',
              error.meta,
            ),
          );
          return;
        }

        this.errorResponseHandler.notify(await response.json());
      }
    } catch (error) {
      this.notifications.error(this.intl.t('common.notifications.generic-error'));
    } finally {
      this.isLoading = false;
    }
  }
}
