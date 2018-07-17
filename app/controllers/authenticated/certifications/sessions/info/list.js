import Controller from '@ember/controller';
import json2csv from 'json2csv';
import { computed } from '@ember/object';

export default Controller.extend({

  progress:false,
  progressMax:0,
  progressCurrent:0,
  progressValue:computed('progressMax', 'progressCurrent', function() {
    let max = this.get('progressMax');
    let current = this.get('progressCurrent');
    if (max > 0 ) {
      return Math.round((current*100)/max);
    } else {
      return 0;
    }
  }),

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
      'Commentaire pour le candidat', 'Commentaire pour l\'organisation', 'Commentaire pour le jury', 'Note Pix'
    ];

    this._csvHeaders = this._csvHeaders.concat(this._competences);

  },

  _getJsonRow(certification) {
    // TODO: handle birthdate
    let data = {
      'ID de certification':certification.get('id'),
      'Prenom du candidat':certification.get('firstName'),
      'Nom du candidat':certification.get('lastName'),
      'Date de naissance du candidat':certification.get('birthdate'),
      'Lieu de naissance du candidat':certification.get('birthplace'),
      'Identifiant Externe':certification.get('externalId'),
      'Statut de la certification':certification.get('status'),
      'ID de session':certification.get('sessionId'),
      'Date de debut':certification.get('creationDate'),
      'Date de fin':certification.get('completionDate'),
      'Commentaire pour le candidat':certification.get('commentForCandidate'),
      'Commentaire pour l\'organisation':certification.get('commentForOrganization'),
      'Commentaire pour le jury':certification.get('commentForJury'),
      'Note Pix':certification.get('pixScore')
    };
    let competences = certification.get('indexedCompetences');
    this._competences.forEach((competence) => {
      data[competence] = (competences[competence] == null)?'':competences[competence].level;
    });
    return data;
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

  _getExportJson(certificationsIds, json) {
    let ids = certificationsIds.splice(0,10);
    return this._getCertificationsJson(ids)
    .then((value) => {
      this.set('progressCurrent', this.get('progressCurrent')+value.length);
      if (certificationsIds.length >0 ) {
        return this._getExportJson(certificationsIds, json.concat(value));
      } else {
        return json.concat(value);
      }
    });
  },

  actions: {
    onExport() {
      let ids = this.get('model.ids');
      this.set('progressMax', ids.length);
      this.set('progress', true);
      this._getExportJson(ids, [])
      .then((json) => {
        return json2csv.parse({
          data: json,
          fieldNames: this._csvHeaders,
          del: ';',
          withBOM: true,
        });
      })
      .then((csv) => {
        //this.set('progress', false);
        console.debug(csv);
      });
    }
  }
});
