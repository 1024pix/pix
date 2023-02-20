import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ToolsController extends Controller {
  @service notifications;
  @service store;
  @service currentUser;

  @action
  async archiveCampaigns(files) {
    const adapter = this.store.adapterFor('import-files');

    this.isLoading = true;
    this.notifications.clearAll();
    try {
      await adapter.importCampaignsToArchive(files);
      this.isLoading = false;
      this.notifications.success('Toutes les campagnes ont été archivées.');
    } catch ({ errors: [error] }) {
      this.isLoading = false;
      if (error.code === 'HEADER_REQUIRED') {
        this.notifications.error("La colonne campaignId n'est pas présente.");
      } else if (error.code === 'HEADER_UNKNOWN') {
        this.notifications.error('Une colonne dans le fichier ne devrait pas être présente.');
      } else if (error.code === 'ENCODING_NOT_SUPPORTED') {
        this.notifications.error('Encodage non supporté.');
      } else {
        this.notifications.error('Une erreur est survenue. OUPS...');
      }
    }
  }
}
