import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { action, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import _ from 'lodash';
import config from 'pix-certif/config/environment';

export default class CertificationCandidatesController extends Controller {

  isResultRecipientEmailVisible = config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE;

  @service session;

  @alias('model.session') currentSession;
  @alias('model.isCertificationCenterSco') isCertificationCenterSco;
  @alias('model.isCertifPrescriptionScoEnabled') isCertifPrescriptionScoEnabled;

  @computed('currentSession.certificationCandidates.{[],@each.isLinked}')
  get importAllowed() {
    return _.every(this.currentSession.certificationCandidates.toArray(), (certificationCandidate) => {
      return !certificationCandidate.isLinked;
    });
  }

  @action
  async importCertificationCandidates(file) {
    const { access_token } = this.session.data.authenticated;
    const importError = this.isResultRecipientEmailVisible ?
      'Veuillez télécharger à nouveau le modèle de liste des candidats et l\'importer à nouveau.' :
      'Veuillez modifier votre fichier et l’importer à nouveau.';
    this.notifications.clearAll();

    try {
      await file.upload(this.currentSession.urlToUpload, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      this.currentSession.certificationCandidates.reload();
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
