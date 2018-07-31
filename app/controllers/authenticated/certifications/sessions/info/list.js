import Controller from '@ember/controller';
import json2csv from 'json2csv';
import Papa from 'papaparse';
import { inject as service } from '@ember/service';

export default Controller.extend({

  // Properties
  progress:false,
  progressMax:0,
  progressValue:0,
  notifications: service('notification-messages'),
  fileSaver: service('file-saver'),
  displayConfirm:false,
  confirmMessage:null,
  confirmAction:'onPublishSelected',
  showSelectedActions:false,
  selectedCertifications:null,

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

    this._csvImportFields = ['firstName', 'lastName', 'birthdate', 'birthplace', 'externalId'];

    this.selected = [];
  },

  // Actions
  actions: {
    onExport() {
      let ids = this.get('model.certificationIds').toArray();
      this.set('progressMax', ids.length);
      this.set('progressValue', 0);
      this.set('progress', true);
      return this._getExportJson(ids, [])
      .then((json) => {
        return json2csv.parse(json, {
          fields: this._csvHeaders,
          delimiter: ';',
          withBOM: false,
        });
      })
      .then((csv) => {
        this.set('progress', false);
        let fileName = 'session_'+this.get('model.session.id')+' '+(new Date()).toLocaleString('fr-FR')+'.csv';
        this.get('fileSaver').saveAs(csv, fileName);
      });
    },
    onImport() {
      let fileInput = document.getElementById('session-list__import-file');
      fileInput.click();
    },
    onImportFileSelect(evt) {
      try {
        let file = evt.target.files[0];
        let reader = new FileReader();
        let that = this;
        reader.onload = function(event) {
          let data = event.target.result;
          // We delete the BOM UTF8 at the beginning of the CSV,
          // otherwise the first element is wrongly parsed.
          const csvRawData = data.toString('utf8').replace(/^\uFEFF/, '');
          const parsedCSVData = Papa.parse(csvRawData, { header: true , skipEmptyLines: true}).data;
          let rowCount = parsedCSVData.length;
          that.set('progressMax', parsedCSVData.length);
          that.set('progressValue', 0);
          that.set('progress', true);
          return that._importCertificationsData(parsedCSVData)
          .then(() => {
            that.set('progress', false);
            that.get('notifications').success(rowCount+ ' lignes correctement importées');
          })
          .catch((error) => {
            that.set('progress', false);
            that.get('notifications').error(error);
          });
        }
        reader.readAsText(file);
      }
      catch(error) {
        this.set('progress', false);
        this.get('notifications').error(error);
      }
    },
    onConfirmPublishSelected() {
      let count = this.get('selectedCertifications').length;
      if (count === 1) {
        this.set('confirmMessage', 'Souhaitez-vous publier la certification sélectionnée ?');
      } else {
        this.set('confirmMessage', 'Souhaitez-vous publier les '+count+' certifications sélectionnées ?');
      }
      this.set('confirmAction', 'onPublishSelected');
      this.set('displayConfirm', true);
    },
    onConfirmUnpublishSelected() {
      let count = this.get('selectedCertifications').length;
      if (count === 1) {
        this.set('confirmMessage', 'Souhaitez-vous dépublier la certification sélectionnée ?');
      } else {
        this.set('confirmMessage', 'Souhaitez-vous dépublier les '+count+' certifications sélectionnées ?');
      }
      this.set('confirmAction', 'onUnpublishSelected');
      this.set('displayConfirm', true);
    },
    onPublishSelected() {
      this._startCertificationPublication(true);
    },
    onUnpublishSelected() {
      this._startCertificationPublication(false);
    },
    onCancelConfirm() {
      this.set('displayConfirm', false);
    },
    onListSelectionChange(e) {
      this.set('selectedCertifications', e.selectedItems);
      this.set('showSelectedActions', e.selectedItems.length > 0);
    }
  },

  // Private methods

  _getExportJson(certificationsIds, json) {
    let ids = certificationsIds.splice(0,10);
    return this._getCertificationsJson(ids)
    .then((value) => {
      this.set('progressValue', this.get('progressValue')+value.length);
      if (certificationsIds.length >0 ) {
        return this._getExportJson(certificationsIds, json.concat(value));
      } else {
        return json.concat(value);
      }
    });
  },

  _importCertificationsData(data) {
    let dataPiece = data.splice(0,10);
    return this._updateCertifications(dataPiece)
    .then(() => {
      this.set('progressValue', this.get('progressValue')+10);
      if (data.length>0) {
        return this._importCertificationsData(data);
      } else {
        return true;
      }
    });
  },

  _startCertificationPublication(value) {
    this.set('displayConfirm', false);
    let certifications = this.get('selectedCertifications');
    let count = certifications.length;
    this.set('progressMax', certifications.length);
    this.set('progressValue', 0);
    this.set('progress', true);
    return this._publishCertifications(certifications.slice(0), value)
    .then(() => {
      this.set('progress', false);
      if (count === 1) {

        this.get('notifications').success('La certification a été correctement '+(value?'publiée':'dépubliée'));
      } else {
        this.get('notifications').success('Les '+count+' certifications ont été correctement '+(value?'publiées':'dépubliées'));
      }
    })
    .catch((error) => {
      this.set('progress', false);
      this.get('notifications').error(error);
    });
  },

  _publishCertifications(certifications, value) {
    let piece = certifications.splice(0,10);
    return this._setCertificationPublished(piece, value)
    .then(() => {
      this.set('progressValue', this.get('progressValue')+10);
      if (certifications.length>0) {
        return this._publishCertifications(certifications, value);
      } else {
        return true;
      }
    });
  },

  _getCertificationsJson(ids) {
    let store = this.get('store');
    let requests = ids.map((id) => {
      return store.findRecord('certification', id)
      .catch(() => {
        // TODO: display error somehow
        return null;
      });
    });
    return Promise.all(requests)
    .then((certifications) => {
      return certifications.reduce((current, certification) => {
        if (certification) {
          current.push(this._getJsonRow(certification));
        }
        return current;
      }, []);
    });
  },

  _getJsonRow(certification) {
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

  _updateCertifications(data) {
    let store = this.get('store');
    let requests = [];
    let newData = {};
    data.forEach((piece) => {
      let id = piece[this._fields.id];
      newData[id] = piece;
      requests.push(store.findRecord('certification', id));
    })
    return Promise.all(requests)
    .then((certifications) => {
      let updateRequests = [];
      certifications.forEach((certification) => {
        let id = certification.get('id');
        let newDataPiece = newData[id];
        this._csvImportFields.forEach((key) => {
          let fieldName = this._fields[key];
          let fieldValue = newDataPiece[fieldName];
          if (fieldValue.length == 0) {
            fieldValue = null;
          }
          certification.set(key, fieldValue);
        });
        // check that session id is correct
        if (certification.get('sessionId') == this.get('model.session.id')) {
          // check that info has changed
          if (Object.keys(certification.changedAttributes()).length>0) {
            updateRequests.push(certification.save({adapterOptions:{updateMarks:false}}));
          }
        }
      })
      return Promise.all(updateRequests);
    })
    .then(() => {
      return true;
    });
  },

  _setCertificationPublished(certifications, value) {
    let promises = certifications.reduce((result, certification) => {
      certification.set('isPublished', value);
      result.push(certification.save({adapterOptions:{updateMarks:false}}));
      return result;
    }, []);
    return Promise.all(promises);
  }
});
