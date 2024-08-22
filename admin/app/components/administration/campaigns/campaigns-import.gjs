import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CampaignsImport extends Component {
  @service intl;
  @service notifications;
  @service router;
  @service store;

  @action
  async importCampaigns(files) {
    this.notifications.clearAll();

    const adapter = this.store.adapterFor('campaigns-import');
    try {
      await adapter.addCampaignsCsv(files);
      this.notifications.success(this.intl.t('components.administration.campaigns-import.notifications.success'));
    } catch (errorResponse) {
      const errors = errorResponse.errors;

      if (!errors) {
        return this.notifications.error(this.intl.t('common.notifications.generic-error'));
      }
      errors.forEach((error) => {
        switch (error.code) {
          case 'MISSING_REQUIRED_FIELD_NAMES':
            this.notifications.error(`${error.meta}`, { autoClear: false });
            break;
          default:
            this.notifications.error(error.detail, { autoClear: false });
        }
      });
    } finally {
      this.isLoading = false;
    }
  }
  <template>
    <section class="page-section">
      <header class="page-section__header">
        <h2 class="page-section__title">{{t "components.administration.campaigns-import.title"}}</h2>
      </header>
      <p class="description">{{t "components.administration.campaigns-import.description"}}</p>
      <PixButtonUpload
        @id="campaigns-file-upload"
        @onChange={{this.importCampaigns}}
        @variant="secondary"
        accept=".csv"
      >
        {{t "components.administration.campaigns-import.upload-button"}}
      </PixButtonUpload>
    </section>
  </template>
}
