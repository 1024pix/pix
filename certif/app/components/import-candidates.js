import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default class ImportCandidates extends Component {
  @service session;
  @service notifications;
  @service store;

  @action
  async importCertificationCandidates(files) {
    const adapter = this.store.adapterFor('certification-candidates-import');
    const sessionId = this.args.session.id;

    this.isLoading = true;
    this.notifications.clearAll();
    try {
      await adapter.addCertificationCandidatesFromOds(sessionId, files);
      this.notifications.success('La liste des candidats a été importée avec succès.');
      this.args.reloadCertificationCandidate();
    } catch (errorResponse) {
      const errorMessage = this._handleErrorMessage(errorResponse);
      this.notifications.error(htmlSafe(errorMessage), { cssClasses: 'certification-candidates-notification' });
    } finally {
      this.isLoading = false;
    }
  }

  _handleErrorMessage(errorResponse) {
    const errorPrefix = 'Aucun candidat n’a été importé. <br>';
    let errorMessage = `${errorPrefix} Veuillez réessayer ou nous contacter via le formulaire du centre d'aide`;

    if (errorResponse.errors) {
      errorResponse.errors.forEach((error) => {
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
    return errorMessage;
  }
}
