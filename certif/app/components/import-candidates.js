import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { action } from '@ember/object';

export default class ImportCandidates extends Component {
  @service session;
  @service notifications;

  @action
  async importCertificationCandidates(file) {
    const { access_token } = this.session.data.authenticated;

    this.notifications.clearAll();

    try {
      await file.upload(this.args.session.urlToUpload, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      this.args.reloadCertificationCandidate();
      this.notifications.success('La liste des candidats a été importée avec succès.');
    } catch (err) {
      const errorPrefix = 'Aucun candidat n’a été importé. <br>';
      let errorMessage = `${errorPrefix} Veuillez réessayer ou nous contacter via le formulaire du centre d'aide`;
      if (err.body.errors) {
        err.body.errors.forEach((error) => {
          if (error.status === '422') {
            if (error.code === 'INVALID_DOCUMENT') {
              errorMessage = htmlSafe(`
              <p>
                ${errorPrefix}<b>${error.detail}</b><br>
                Veuillez télécharger à nouveau le modèle de liste des candidats et l'importer à nouveau.
              </p>`);
            } else {
              errorMessage = htmlSafe(`
              <p>
                ${errorPrefix}<b>${error.detail}</b>
              </p>`);
            }
          }
          if (error.status === '403' && error.detail === 'At least one candidate is already linked to a user') {
            errorMessage = "La session a débuté, il n'est plus possible de modifier la liste des candidats.";
          }
        });
      }
      this.notifications.error(htmlSafe(errorMessage), { cssClasses: 'certification-candidates-notification' });
    }
  }
}
