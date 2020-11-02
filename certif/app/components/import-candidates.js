import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { action } from '@ember/object';
import config from 'pix-certif/config/environment';

export default class ImportCandidates extends Component {
  isResultRecipientEmailVisible = config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS;

  @service session;
  @service notifications;

  @action
  async importCertificationCandidates(file) {
    const { access_token } = this.session.data.authenticated;
    const importError = this.isResultRecipientEmailVisible ?
      'Veuillez télécharger à nouveau le modèle de liste des candidats et l\'importer à nouveau.' :
      'Veuillez modifier votre fichier et l’importer à nouveau.';
    this.notifications.clearAll();

    try {
      await file.upload(this.args.session.urlToUpload, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      this.args.reloadCertificationCandidate();
      this.notifications.success('La liste des candidats a été importée avec succès.');
    }
    catch (err) {
      const errorPrefix = 'Aucun candidat n’a été importé. <br>';
      const defaultErrorMessage = `${errorPrefix} Veuillez réessayer ou nous contacter via le formulaire du centre d'aide`;
      let errorMessage = defaultErrorMessage;
      if (err.body.errors) {
        err.body.errors.forEach((error) => {
          if (error.status === '422') {
            errorMessage = htmlSafe(`<p>${errorPrefix}<b>${error.detail}</b> <br>${importError}</p>`);
          }
          if (error.status === '403' && error.detail === 'At least one candidate is already linked to a user') {
            errorMessage = 'La session a débuté, il n\'est plus possible de modifier la liste des candidats.';
          }
        });
      }
      this.notifications.error(htmlSafe(errorMessage), { cssClasses: 'certification-candidates-notification' });
    }
  }
}
