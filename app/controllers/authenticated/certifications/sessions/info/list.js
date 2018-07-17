import Controller from '@ember/controller';
import json2csv from 'json2csv';
import { computed } from '@ember/object';
import FileSaver from 'file-saver';

export default Controller.extend({

  // Properties
  progress:false,
  progressMax:0,
  progressCurrent:0,

  // Computed properties
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
    this._fields = {
      id:'ID de certification',
      firstName:'Prenom du candidat',
      lastName:'Nom du candidat',
      birthdate:'Date de naissance du candidat',
      birthplace:'Lieu de naissance du candidat',
      externalId:'Identifiant Externe',
      status:'Statut de la certification',
      sessionId:'ID de session',
      creationDate:'Date de debut',
      completionDate:'Date de fin',
      commentForCandidate:'Commentaire pour le candidat',
      commentForOrganization:'Commentaire pour l\'organisation',
      commentForJury:'Commentaire pour le jury',
      pixScore:'Note Pix'
    };

    this._csvHeaders = Object.values(this._fields).concat(this._competences);

  },

  // Actions
  actions: {
    onExport() {
      let ids = this.get('model.certificationIds').toArray();
      this.set('progressMax', ids.length);
      this.set('progress', true);
      this._getExportJson(ids, [])
      .then((json) => {
        return json2csv.parse(json, {
          fields: this._csvHeaders,
          delimiter: ';',
          withBOM: true,
        });
      })
      .then((csv) => {
        this.set('progress', false);
        let fileName = 'session_'+this.get('model.session.id')+' '+(new Date()).toLocaleString('fr-FR')+'.csv';
        let csvFile = new File([csv], fileName, {type:'text/csv;charset=utf-8'});
        FileSaver.saveAs(csvFile);
      });
    }
  },

  // Private methods
  _getJsonRow(certification) {
    // TODO: handle birthdate

    let data = Object.keys(this._fields).reduce((currentData, field) => {
      let header = this._fields[field];
      currentData[header] = certification.get(field);
      return currentData;
    }, {});
    let competences = certification.get('indexedCompetences');
    this._competences.forEach((competence) => {
      data[competence] = (competences[competence] == null)?'':competences[competence].level;
    });
    return data;
  },

  _getCertificationsJson(ids) {
    let store = this.get('store');
    let requests = ids.map((id) => {
      return store.findRecord('certification', id);
    });
    return Promise.all(requests)
    .then((certifications) => {
      return certifications.map((certification) => {
        return this._getJsonRow(certification);
      });
    });
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
  }

});
