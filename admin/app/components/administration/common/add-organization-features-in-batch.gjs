import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-admin/config/environment';

import AdministrationBlockLayout from '../block-layout';

export default class AddOrganizationFeaturesInBatch extends Component {
  @service intl;
  @service notifications;
  @service session;
  @service errorResponseHandler;

  @action
  async addOrganizationFeaturesInBatch(files) {
    this.notifications.clearAll();

    let response;
    try {
      const fileContent = files[0];

      const token = this.session.data.authenticated.access_token;
      response = await window.fetch(`${ENV.APP.API_HOST}/api/admin/organizations/add-organization-features`, {
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
          this.intl.t('components.administration.add-organization-features-in-batch.notifications.success'),
        );
        return;
      } else {
        this.errorResponseHandler.notify(await response.json());
      }
    } catch (error) {
      this.notifications.error(this.intl.t('common.notifications.generic-error'));
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <AdministrationBlockLayout
      @title={{t "components.administration.add-organization-features-in-batch.title"}}
      @description={{t "components.administration.add-organization-features-in-batch.description"}}
    >
      <PixButtonUpload
        @id="organizations-batch-update-file-upload"
        @onChange={{this.addOrganizationFeaturesInBatch}}
        @variant="secondary"
        accept=".csv"
      >
        {{t "components.administration.add-organization-features-in-batch.upload-button"}}
      </PixButtonUpload>
    </AdministrationBlockLayout>
  </template>
}
