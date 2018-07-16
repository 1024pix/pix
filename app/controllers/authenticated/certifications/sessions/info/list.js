import Controller from '@ember/controller';
//import json2csv from 'json2csv';

export default Controller.extend({

  init() {
    this._super();
    this._competences = [
      '1.1', '1.2', '1.3',
      '2.1', '2.2', '2.3', '2.4',
      '3.1', '3.2', '3.3', '3.4',
      '4.1', '4.2', '4.3',
      '5.1', '5.2'
    ]
    this._csvHeaders = [
      'ID de certification',
      'Prenom du candidat', 'Nom du candidat', 'Date de naissance du candidat', 'Lieu de naissance du candidat', 'Identifiant Externe',
      'Statut de la certification', 'ID de session', 'Date de debut', 'Date de fin',
      'Commentaire pour le candidat', 'Commentaire pour l\'organisation', 'Commentaire pour le jury', 'Note Pix',
    ];

    this._csvHeaders = this._csvHeaders.concat(this._competences);

  },

  _getJsonRow(certification) {
    // TODO: handle birthdate
    return {
      id:certification.get('id'),
      firstName:certification.get('firstName'),
      lastName:certification.get('lastName'),
      birthdate:certification.get('birthdate'),
      externalId:certification.get('externalId'),
      status:certification.get('status'),
      sessionNumber:certification.get('sessionId'),
      dateStart:certification.get('creationDate'),
      dateEnd:certification.get('completionDate'),
      commentCandidate:certification.get('commentForCandidate'),
      commentOrganization:certification.get('commentForOrganization'),
      commentJury:certification.get('commentForJury'),
      note:certification.get('pixScore')
    }
  },

  _getCertificationsJson(ids) {
    let store = this.get('store');
    let requests = ids.reduce((result, id) => {
      result.push(store.findRecord('certification', id));
      return result;
    }, []);
    return Promise.all(requests)
    .then((certifications) => {
      return certifications.reduce((result, certification) => {
        result.push(this._getJsonRow(certification));
        return result;
      }, []);
    })
  },

  _getExportJson() {
    //let ids = certificationIds.splice(0,10);
  },

  actions: {
    onExport() {
      //let ids = this.get('model.ids');
      //this._getCertificationSet(ids);

    }
  }
});
