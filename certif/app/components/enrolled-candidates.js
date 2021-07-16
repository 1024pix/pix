import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import EmberObject, { action } from '@ember/object';
import get from 'lodash/get';
import toNumber from 'lodash/toNumber';

export default class EnrolledCandidates extends Component {

  @service store;
  @service notifications;
  @tracked candidatesInStaging = [];
  @tracked newCandidate = {};
  @tracked shouldDisplayCertificationCandidateModal = false;
  @tracked certificationCandidateInDetailsModal = null;
  @tracked showNewCertificationCandidateModal = false;

  get isCandidateBeingAdded() {
    return this.candidatesInStaging.length > 0;
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
      if (get(err, 'errors[0].code') === 403) {
        errorText = 'Ce candidat a déjà rejoint la session. Vous ne pouvez pas le supprimer.';
      }
      this.notifications.error(errorText);
    }
  }

  @action
  addCertificationCandidateInStaging() {
    if (!this.args.isNewCpfDataToggleEnabled) {
      this.candidatesInStaging.pushObject(EmberObject.create({
        firstName: '', lastName: '', birthdate: '', birthCity: '',
        birthProvinceCode: '', birthCountry: '', email: '', externalId: '',
        extraTimePercentage: '' }));
    }

    if (this.args.isNewCpfDataToggleEnabled) {
      this.newCandidate = EmberObject.create({
        firstName: '', lastName: '', birthdate: '', birthCity: '',
        birthCountry: 'FRANCE', email: '', externalId: '', resultRecipientEmail: '',
        birthPostalCode: '', birthInseeCode: '', sex: '', extraTimePercentage: '' });
    }
  }

  @action
  async addCertificationCandidate(candidate) {
    const certificationCandidate = { ...candidate };
    certificationCandidate.extraTimePercentage = this._fromPercentageStringToDecimal(candidate.extraTimePercentage);
    const success = await this.saveCertificationCandidate(certificationCandidate);
    if (success) {
      this.candidatesInStaging.removeObject(candidate);
      this.closeNewCertificationCandidateModal();
    }
  }

  @action
  removeCertificationCandidateFromStaging(candidate) {
    this.candidatesInStaging.removeObject(candidate);
  }

  @action
  updateCertificationCandidateInStagingFieldFromEvent(candidateInStaging, field, ev) {
    const { value } = ev.target;
    candidateInStaging.set(field, value);
  }

  @action
  updateCertificationCandidateInStagingFieldFromValue(candidateInStaging, field, value) {
    candidateInStaging.set(field, value);
  }

  @action
  updateCertificationCandidateInStagingBirthdate(candidateInStaging, value) {
    candidateInStaging.set('birthdate', value);
  }

  @action
  async saveCertificationCandidate(certificationCandidateData) {
    this.notifications.clearAll();
    const certificationCandidate = this._createCertificationCandidateRecord(certificationCandidateData);

    if (this._hasDuplicate(certificationCandidate)) {
      this._handleDuplicateError(certificationCandidate);
      return;
    }

    try {
      await certificationCandidate
        .save({ adapterOptions: { registerToSession: true, sessionId: this.args.sessionId } });
      this.args.reloadCertificationCandidate();
      this.notifications.success('Le candidat a été ajouté avec succès.');
      return true;
    } catch (err) {
      if (this._hasConflict(err)) {
        this._handleDuplicateError(certificationCandidate);
      } else if (this._isEntityUnprocessable(err)) {
        this._handleEntityValidationError(certificationCandidate, err);
      } else {
        this._handleUnknownSavingError(certificationCandidate);
      }

      return false;
    }
  }

  @action
  openCertificationCandidateDetailsModal(candidate) {
    this.shouldDisplayCertificationCandidateModal = true;
    this.certificationCandidateInDetailsModal = candidate;
  }

  @action
  closeCertificationCandidateDetailsModal() {
    this.shouldDisplayCertificationCandidateModal = false;
    this.certificationCandidateInDetailsModal = null;
  }

  @action
  openNewCertificationCandidateModal() {
    this.addCertificationCandidateInStaging();
    this.showNewCertificationCandidateModal = true;
  }

  @action
  closeNewCertificationCandidateModal() {
    this.showNewCertificationCandidateModal = false;
  }

  _createCertificationCandidateRecord(certificationCandidateData) {
    return this.store.createRecord('certification-candidate', {
      firstName: this._trimOrUndefinedIfFalsy(certificationCandidateData.firstName),
      lastName: this._trimOrUndefinedIfFalsy(certificationCandidateData.lastName),
      sex: this._trimOrUndefinedIfFalsy(certificationCandidateData.sex),
      birthdate: certificationCandidateData.birthdate,
      birthCountry: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthCountry),
      birthInseeCode: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthInseeCode),
      birthPostalCode: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthPostalCode),
      birthCity: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthCity),
      birthProvinceCode: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthProvinceCode),
      externalId: this._trimOrUndefinedIfFalsy(certificationCandidateData.externalId),
      email: this._trimOrUndefinedIfFalsy(certificationCandidateData.email),
      resultRecipientEmail: this._trimOrUndefinedIfFalsy(certificationCandidateData.resultRecipientEmail),
      extraTimePercentage: certificationCandidateData.extraTimePercentage,
    });
  }

  _handleDuplicateError(certificationCandidate) {
    const errorText = 'Ce candidat est déjà dans la liste, vous ne pouvez pas l\'ajouter à nouveau.';
    this._handleSavingError(errorText, certificationCandidate);
  }

  _handleUnknownSavingError(certificationCandidate) {
    const errorText = 'Une erreur s\'est produite lors de l\'ajout du candidat.';
    this._handleSavingError(errorText, certificationCandidate);
  }

  _handleEntityValidationError(certificationCandidate, err) {
    const errorText = get(err, 'errors[0].detail');
    this._handleSavingError(errorText, certificationCandidate);
  }

  _handleSavingError(errorText, certificationCandidate) {
    this.notifications.error(errorText);
    certificationCandidate.deleteRecord();
  }

  _hasConflict(err) {
    return get(err, 'errors[0].status') === '409';
  }

  _isEntityUnprocessable(err) {
    return get(err, 'errors[0].status') === '422';
  }

  _hasDuplicate(certificationCandidate) {
    const currentFirstName = certificationCandidate.firstName;
    const currentLastName = certificationCandidate.lastName;
    const currentBirthdate = certificationCandidate.birthdate;

    return this.args.certificationCandidates.find(({ lastName, firstName, birthdate }) =>
      lastName.toLowerCase() === currentLastName.toLowerCase() &&
      firstName.toLowerCase() === currentFirstName.toLowerCase() &&
      birthdate === currentBirthdate) !== undefined;
  }

  _fromPercentageStringToDecimal(value) {
    return value ?
      toNumber(value) / 100 : value;
  }

  _trimOrUndefinedIfFalsy(str) {
    return str ? str.trim() : undefined;
  }
}
