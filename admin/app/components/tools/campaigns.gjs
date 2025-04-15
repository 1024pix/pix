import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class ToolsCampaigns extends Component {
  @service pixToast;
  @service store;

  @action
  async archiveCampaigns(files) {
    const adapter = this.store.adapterFor('import-files');

    this.isLoading = true;
    try {
      await adapter.importCampaignsToArchive(files);
      this.isLoading = false;
      this.pixToast.sendSuccessNotification({ message: 'Toutes les campagnes ont été archivées.' });
    } catch ({ errors: [error] }) {
      this.isLoading = false;
      if (error.code === 'HEADER_REQUIRED') {
        this.pixToast.sendErrorNotification({ message: "La colonne campaignId n'est pas présente." });
      } else if (error.code === 'HEADER_UNKNOWN') {
        this.pixToast.sendErrorNotification({ message: 'Une colonne dans le fichier ne devrait pas être présente.' });
      } else if (error.code === 'ENCODING_NOT_SUPPORTED') {
        this.pixToast.sendErrorNotification({ message: 'Encodage non supporté.' });
      } else {
        this.pixToast.sendErrorNotification({ message: 'Une erreur est survenue. OUPS...' });
      }
    }
  }

  <template>
    <section class="page-section">
      <header class="page-section__header">
        <h2 class="page-section__title">Archiver des campagnes en masse</h2>
      </header>
      <PixNotificationAlert class="tools__warning" @type="warning" @withIcon={{true}}>
        L'envoi du fichier .csv via le bouton ci-dessous va archiver toutes campagnes renseignées.<br />
        Le fichier ne doit comporter qu'une seule colonne, correspondant aux id des campagnes, et avoir comme en-tête
        <strong>“campaignId”</strong>
        dans la première cellule de la colonne.
      </PixNotificationAlert>
      <PixButtonUpload @id="file-upload" @onChange={{this.archiveCampaigns}} accept=".csv">
        Envoyer le fichier des campagnes à archiver
      </PixButtonUpload>
    </section>
  </template>
}
