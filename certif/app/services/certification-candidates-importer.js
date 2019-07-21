import Service, { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import _ from 'lodash';
import moment from 'moment';

export default Service.extend({
  store: service(),

  async handleCertificationCandidatesImport(session, certificationCandidatesRaw) {
    if (session.hasMany('certificationCandidates').ids().length > 0) {
      try {
        await _deleteCertificationCandidatesInSession(session);
      } catch (error) {
        this.displayCertificationCandidateDeletionError();
      }
    }
    try {
      await _createCertificationCandidateInSession(session, certificationCandidatesRaw);
      this.displaySuccess();
    } catch (error) {
      this.displayCertificationCandidateCreationError();
    }
  },

  // TODO
  displayCertificationCandidateDeletionError() {
  //console.log('TODO afficher erreur suppression candidat');
  },

  // TODO
  displaySuccess() {
    //console.log('TODO afficher info bulle SUCCES lors de l import');
  },

  // TODO
  displayFileParsingError() {
    //console.log('TODO afficher info bulle ERREUR lors du parsing fichier');
  },

  // TODO
  displayCertificationCandidateCreationError() {
    //console.log('TODO afficher erreur creation candidat');
  },

});

async function _createCertificationCandidateInSession(session, certificationCandidatesRaw) {
  const certificationCandidatesToSave = [];
  _.each(certificationCandidatesRaw, (certificationCandidateRaw) => {
    const certificationCandidate = _convertJSONCertificationCandidateToModel(certificationCandidateRaw);
    certificationCandidate.session = session;
    certificationCandidatesToSave.push(this.store.createRecord('certification-candidate', certificationCandidate).save());
  });

  await RSVP.all(certificationCandidatesToSave);
}

async function _deleteCertificationCandidatesInSession(session) {
  // TODO session model won't update after candidates deletion
  const certificationCandidatesToDelete = [];
  const ids = session.hasMany('certificationCandidates').ids();
  _.each(ids, async (id) => {
    const certificationCandidateToDelete = await this.store.findRecord('certification-candidate', id, { backgroundReload: false });
    certificationCandidatesToDelete.push(certificationCandidateToDelete.destroyRecord({}));
  });

  await RSVP.all(certificationCandidatesToDelete);
}

function _convertJSONCertificationCandidateToModel(certificationCandidateRaw) {
  const certificationCandidate = {};
  certificationCandidate.firstName = certificationCandidateRaw.attributes['first-name'];
  certificationCandidate.lastName = certificationCandidateRaw.attributes['last-name'];
  certificationCandidate.birthdate = moment(certificationCandidateRaw.attributes['birthdate']).format('DD/MM/YYYY');
  certificationCandidate.birthCity = certificationCandidateRaw.attributes['birth-city'];
  certificationCandidate.birthProvince = certificationCandidateRaw.attributes['birth-province'];
  certificationCandidate.birthCountry = certificationCandidateRaw.attributes['birth-country'];
  certificationCandidate.externalId = certificationCandidateRaw.attributes['external-id'];
  certificationCandidate.extraTimePercentage = certificationCandidateRaw.attributes['extra-time-percentage'];

  return certificationCandidate;
}
