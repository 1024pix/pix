import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import EmberObject, { action, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';

import config from '../../../../config/environment';

export default class AuthenticatedSessionsDetailsCertificationCandidatesController extends Controller {

  @alias('model') currentSession;
  @tracked candidatesInStaging;
  @service session;
  @service notifications;

  constructor() {
    super(...arguments);

    this.candidatesInStaging = [];
  }

  @computed('currentSession.certificationCandidates.{[],@each.isLinked}')
  get importAllowed() {
    return _.every(this.currentSession.certificationCandidates.toArray(), (certificationCandidate) => {
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

  @action
  async importCertificationCandidates(file) {
    const { access_token } = this.session.data.authenticated;
    this.notifications.clearAll();

    const autoClear = config.notifications.autoClear;
    const clearDuration = config.notifications.clearDuration;

    try {
      await file.upload(this.currentSession.urlToUpload, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      this.currentSession.certificationCandidates.reload();
      this.notifications.success('La liste des candidats a été importée avec succès', {
        autoClear,
        clearDuration,
      });
    }
    catch (err) {
      const errorDetail = err.body.errors[0].detail ? err.body.errors[0].detail : null;
      if (errorDetail === 'At least one candidate is already linked to a user') {
        this.notifications.error('La session a débuté, il n\'est plus possible de modifier la liste des candidats.', {
          autoClear,
          clearDuration,
        });
      } else {
        this.notifications.error('Une erreur s\'est produite lors de l\'import des candidats', {
          autoClear,
          clearDuration,
        });
      }
    }
  }

  @action
  async saveCertificationCandidate(certificationCandidateData) {
    this.notifications.clearAll();
    const autoClear = config.notifications.autoClear;
    const clearDuration = config.notifications.clearDuration;
    const sessionId = this.model.id;
    const certificationCandidate = this.store.createRecord('certification-candidate', {
      firstName: this._trimOrUndefinedIfFalsy(certificationCandidateData.firstName),
      lastName: this._trimOrUndefinedIfFalsy(certificationCandidateData.lastName),
      birthdate: certificationCandidateData.birthdate,
      birthCity: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthCity),
      birthProvinceCode: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthProvinceCode),
      birthCountry: this._trimOrUndefinedIfFalsy(certificationCandidateData.birthCountry),
      externalId: this._trimOrUndefinedIfFalsy(certificationCandidateData.externalId),
      email: this._trimOrUndefinedIfFalsy(certificationCandidateData.email),
      extraTimePercentage: certificationCandidateData.extraTimePercentage,
    });

    try {
      await certificationCandidate
        .save({ adapterOptions: { registerToSession: true, sessionId } });
      this.model.certificationCandidates.pushObject(certificationCandidate);
      this.notifications.success('Le candidat a été ajouté avec succès.', {
        autoClear,
        clearDuration,
      });
    } catch (err) {
      this.notifications.error('Une erreur s\'est produite lors de l\'ajout du candidat.', {
        autoClear,
        clearDuration,
      });
      return false;
    }

    return true;
  }

  @action
  async deleteCertificationCandidate(certificationCandidate) {
    this.notifications.clearAll();
    const autoClear = config.notifications.autoClear;
    const clearDuration = config.notifications.clearDuration;
    const sessionId = this.model.id;

    try {
      await certificationCandidate.destroyRecord({ adapterOptions: { sessionId } });
      this.notifications.success('Le candidat a été supprimé avec succès.', {
        autoClear,
        clearDuration,
      });
    } catch (err) {
      let errorText = 'Une erreur s\'est produite lors de la suppression du candidat';
      if (_.get(err, 'errors[0].code') === 403) {
        errorText = 'Ce candidat a déjà rejoint la session. Vous ne pouvez pas le supprimer.';
      }
      this.notifications.error(errorText, {
        autoClear,
        clearDuration,
      });
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

