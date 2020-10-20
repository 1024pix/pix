import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import EmberObject, { action, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';
import config from 'pix-certif/config/environment';

export default class CertificationCandidatesController extends Controller {

  isResultRecipientEmailVisible = config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE;

  @service notifications;
  @service session;

  @alias('model.session') currentSession;
  @alias('model.isUserFromSco') isUserFromSco;
  @alias('model.isCertifPrescriptionScoEnabled') isCertifPrescriptionScoEnabled;
  @alias('model.certificationCandidates') certificationCandidates;

  @tracked candidatesInStaging = [];

  @computed('certificationCandidates.{[],@each.isLinked}')
  get importAllowed() {
    return _.every(this.certificationCandidates.toArray(), (certificationCandidate) => {
      return !certificationCandidate.isLinked;
    });
  }

  get isCandidateBeingAdded() {
    return this.candidatesInStaging.length > 0;
  }

  _trimOrUndefinedIfFalsy(str) {
    return str ? str.trim() : undefined;
  }

  _fromPercentageStringToDecimal(value) {
    return value ?
      _.toNumber(value) / 100 : value;
  }

  _hasDuplicate({ currentLastName, currentFirstName, currentBirthdate }) {
    return this.certificationCandidates.find(({ lastName, firstName, birthdate }) =>
      lastName.toLowerCase() === currentLastName.toLowerCase() &&
      firstName.toLowerCase() === currentFirstName.toLowerCase() &&
      birthdate === currentBirthdate) !== undefined;
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
      this.model.reloadCertificationCandidate();
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

  @action
  async saveCertificationCandidate(certificationCandidateData) {
    this.notifications.clearAll();
    const sessionId = this.currentSession.id;
    const certificationCandidate = this.store.createRecord('certification-candidate', {
      firstName: this._trimOrUndefinedIfFalsy(certificationCandidateData.firstName),
      lastName: this._trimOrUndefinedIfFalsy(certificationCandidateData.lastName),
      birthdate: certificationCandidateData.birthdate,
      birthCity: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthCity),
      birthProvinceCode: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthProvinceCode),
      birthCountry: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthCountry),
      externalId: this._trimOrUndefinedIfFalsy(certificationCandidateData.externalId),
      email: this._trimOrUndefinedIfFalsy(certificationCandidateData.email),
      resultRecipientEmail: this._trimOrUndefinedIfFalsy(certificationCandidateData.resultRecipientEmail),
      extraTimePercentage: certificationCandidateData.extraTimePercentage,
    });

    try {
      const hasDuplicate = this._hasDuplicate({
        currentFirstName: certificationCandidate.firstName,
        currentLastName: certificationCandidate.lastName,
        currentBirthdate: certificationCandidate.birthdate,
      });
      if (hasDuplicate) {
        throw 'Duplicate';
      }
      await certificationCandidate
        .save({ adapterOptions: { registerToSession: true, sessionId } });
      this.model.reloadCertificationCandidate();
      this.notifications.success('Le candidat a été ajouté avec succès.');
    } catch (err) {
      let errorText = 'Une erreur s\'est produite lors de l\'ajout du candidat.';
      if (_.get(err, 'errors[0].status') === '409' || err === 'Duplicate') {
        errorText = 'Ce candidat est déjà dans la liste, vous ne pouvez pas l\'ajouter à nouveau.';
      }
      this.notifications.error(errorText);
      certificationCandidate.deleteRecord();
      return false;
    }

    return true;
  }

  @action
  async deleteCertificationCandidate(certificationCandidate) {
    this.notifications.clearAll();
    const sessionId = this.currentSession.id;

    try {
      await certificationCandidate.destroyRecord({ adapterOptions: { sessionId } });
      this.notifications.success('Le candidat a été supprimé avec succès.');
    } catch (err) {
      let errorText = 'Une erreur s\'est produite lors de la suppression du candidat';
      if (_.get(err, 'errors[0].code') === 403) {
        errorText = 'Ce candidat a déjà rejoint la session. Vous ne pouvez pas le supprimer.';
      }
      this.notifications.error(errorText);
    }
  }

  @action
  addCertificationCandidateInStaging() {
    this.candidatesInStaging.pushObject(EmberObject.create({
      firstName: '', lastName: '', birthdate: '', birthCity: '',
      birthProvinceCode: '', birthCountry: '', email: '', externalId: '',
      extraTimePercentage: '' }));
  }

  @action
  async addCertificationCandidate(candidate) {
    const realCertificationCandidateData = { ...candidate };
    realCertificationCandidateData.extraTimePercentage = this._fromPercentageStringToDecimal(candidate.extraTimePercentage);
    const success = await this.saveCertificationCandidate(realCertificationCandidateData);
    if (success) {
      this.candidatesInStaging.removeObject(candidate);
    }
  }

  @action
  removeCertificationCandidateFromStaging(candidate) {
    this.candidatesInStaging.removeObject(candidate);
  }

  @action
  updateCertificationCandidateInStagingBirthdate(candidateInStaging, value) {
    candidateInStaging.set('birthdate', value);
  }

  @action
  updateCertificationCandidateInStagingField(candidateInStaging, field, ev) {
    const { value } = ev.target;
    candidateInStaging.set(field, value);
  }
}
