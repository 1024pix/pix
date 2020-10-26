import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import EmberObject, { action } from '@ember/object';
import _ from 'lodash';

import config from 'pix-certif/config/environment';

export default class EnrolledCandidates extends Component {
  isResultRecipientEmailVisible = config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE;

  @service store;
  @service notifications;
  @tracked candidatesInStaging = [];

  get isCandidateBeingAdded() {
    return this.candidatesInStaging.length > 0;
  }

  get isScoSession() {
    return this.args.isCertifPrescriptionScoEnabled && this.args.isCertificationCenterSco;
  }

  @action
  async deleteCertificationCandidate(certificationCandidate) {
    this.notifications.clearAll();
    const sessionId = this.args.sessionId;

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

  @action
  async saveCertificationCandidate(certificationCandidateData) {
    this.notifications.clearAll();
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
        .save({ adapterOptions: { registerToSession: true, sessionId: this.args.sessionId } });
      this.args.certificationCandidates.unshiftObject(certificationCandidate);
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

  _hasDuplicate({ currentLastName, currentFirstName, currentBirthdate }) {
    return this.args.certificationCandidates.find(({ lastName, firstName, birthdate }) =>
      lastName.toLowerCase() === currentLastName.toLowerCase() &&
      firstName.toLowerCase() === currentFirstName.toLowerCase() &&
      birthdate === currentBirthdate) !== undefined;
  }

  _fromPercentageStringToDecimal(value) {
    return value ?
      _.toNumber(value) / 100 : value;
  }

  _trimOrUndefinedIfFalsy(str) {
    return str ? str.trim() : undefined;
  }
}
