import Controller from '@ember/controller';
import json2csv from 'json2csv';
import { inject as service } from '@ember/service';
/*
 * Important note:
 * this dependency to 'xlsx' has to be removed when session report import is removed from admin
 */
import XLSX from 'xlsx';

export default Controller.extend({

  // Properties
  progress: false,
  progressMax: 0,
  progressValue: 0,
  notifications: service('notification-messages'),
  fileSaver: service('file-saver'),
  displayConfirm: false,
  displaySessionReport: false,
  confirmMessage: null,
  confirmAction: 'onPublishSelected',
  showSelectedActions: false,
  selectedCertifications: null,
  csvImport:false,

  init() {
    this._super();
    this._competences = [
      '1.1', '1.2', '1.3',
      '2.1', '2.2', '2.3', '2.4',
      '3.1', '3.2', '3.3', '3.4',
      '4.1', '4.2', '4.3',
      '5.1', '5.2'
    ];
    this._fields = {
      id: 'ID de certification',
      firstName: 'Prenom du candidat',
      lastName: 'Nom du candidat',
      birthdate: 'Date de naissance du candidat',
      birthplace: 'Lieu de naissance du candidat',
      externalId: 'Identifiant Externe',
      status: 'Statut de la certification',
      sessionId: 'ID de session',
      creationDate: 'Date de debut',
      completionDate: 'Date de fin',
      commentForCandidate: 'Commentaire pour le candidat',
      commentForOrganization: 'Commentaire pour l\'organisation',
      commentForJury: 'Commentaire pour le jury',
      pixScore: 'Note Pix'
    };

    this._csvHeaders = Object.values(this._fields).concat(this._competences);

    this._csvImportFields = ['firstName', 'lastName', 'birthdate', 'birthplace', 'externalId'];

    this.selected = [];

    this.importedCandidates = [];
  },

  // Actions
  actions: {
    onExport() {
      const ids = this.get('model.certificationIds').toArray();
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
          const fileName = 'session_' + this.get('model.session.id') + ' ' + (new Date()).toLocaleString('fr-FR') + '.csv';
          this.fileSaver.saveAs(csv + '\n', fileName);
        });
    },
    onImport(csvImport) {
      this.set('csvImport', csvImport);
      const fileInput = document.getElementById('session-list__import-file');
      fileInput.click();
    },
    onImportFileSelect(evt) {
      try {
        const file = evt.target.files[0];
        const reader = new FileReader();
        const that = this;
        const csvImport = this.get('csvImport');
        reader.onload = function(event) {
          if (csvImport) {
            return that._importCSVData(event.target.result);
          } else {
            return that._importODSReport(event.target.result);
          }
        };
        if (csvImport) {
          reader.readAsText(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      } catch (error) {
        this.set('progress', false);
        this.notifications.error(error);
      }
    },
    onConfirmPublishSelected() {
      const count = this.selectedCertifications.length;
      if (count === 1) {
        this.set('confirmMessage', 'Souhaitez-vous publier la certification sélectionnée ?');
      } else {
        this.set('confirmMessage', 'Souhaitez-vous publier les ' + count + ' certifications sélectionnées ?');
      }
      this.set('confirmAction', 'onPublishSelected');
      this.set('displayConfirm', true);
    },
    onConfirmUnpublishSelected() {
      const count = this.selectedCertifications.length;
      if (count === 1) {
        this.set('confirmMessage', 'Souhaitez-vous dépublier la certification sélectionnée ?');
      } else {
        this.set('confirmMessage', 'Souhaitez-vous dépublier les ' + count + ' certifications sélectionnées ?');
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
    },

    /*
     * Important note:
     * These actions will be removed when session report import is removed from admin
     * (temporary code)
     */

    onHideSessionReport() {
      this.set('displaySessionReport', false);
    },

    /*
     * End of temporary code
     */

  },

  // Private methods

  _getExportJson(certificationsIds, json) {
    const ids = certificationsIds.splice(0, 10);
    return this._getCertificationsJson(ids)
      .then((value) => {
        this.set('progressValue', this.progressValue + value.length);
        if (certificationsIds.length > 0) {
          return this._getExportJson(certificationsIds, json.concat(value));
        } else {
          return json.concat(value);
        }
      });
  },

  _importCertificationsData(data) {
    const dataPiece = data.splice(0, 10);
    return this._updateCertifications(dataPiece)
      .then(() => {
        this.set('progressValue', this.progressValue + 10);
        if (data.length > 0) {
          return this._importCertificationsData(data);
        } else {
          return true;
        }
      });
  },

  _startCertificationPublication(value) {
    this.set('displayConfirm', false);
    const certifications = this.selectedCertifications;
    const count = certifications.length;
    this.set('progressMax', certifications.length);
    this.set('progressValue', 0);
    this.set('progress', true);
    return this._publishCertifications(certifications.slice(0), value)
      .then(() => {
        this.set('progress', false);
        if (count === 1) {

          this.notifications.success('La certification a été correctement ' + (value ? 'publiée' : 'dépubliée'));
        } else {
          this.notifications.success('Les ' + count + ' certifications ont été correctement ' + (value ? 'publiées' : 'dépubliées'));
        }
      })
      .catch((error) => {
        this.set('progress', false);
        this.notifications.error(error);
      });
  },

  _publishCertifications(certifications, value) {
    const piece = certifications.splice(0, 10);
    return this._setCertificationPublished(piece, value)
      .then(() => {
        this.set('progressValue', this.progressValue + 10);
        if (certifications.length > 0) {
          return this._publishCertifications(certifications, value);
        } else {
          return true;
        }
      });
  },

  _getCertificationsJson(ids) {
    const store = this.store;
    const requests = ids.map((id) => {
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
    const data = Object.keys(this._fields).reduce((currentData, field) => {
      const header = this._fields[field];
      currentData[header] = certification.get(field);
      return currentData;
    }, {});
    const competences = certification.get('indexedCompetences');
    this._competences.forEach((competence) => {
      data[competence] = (competences[competence] == null) ? '' : competences[competence].level;
    });
    return data;
  },

  _updateCertifications(data) {
    const store = this.store;
    const requests = [];
    const newData = {};
    data.forEach((piece) => {
      const id = piece[this._fields.id];
      newData[id] = piece;
      requests.push(store.findRecord('certification', id));
    });
    return Promise.all(requests)
      .then((certifications) => {
        const updateRequests = [];
        certifications.forEach((certification) => {
          const id = certification.get('id');
          const newDataPiece = newData[id];
          this._csvImportFields.forEach((key) => {
            const fieldName = this._fields[key];
            let fieldValue = newDataPiece[fieldName];
            if (fieldValue.length == 0) {
              fieldValue = null;
            }
            certification.set(key, fieldValue);
          });
          // check that session id is correct
          if (certification.get('sessionId') == this.get('model.session.id')) {
            // check that info has changed
            if (Object.keys(certification.changedAttributes()).length > 0) {
              updateRequests.push(certification.save({ adapterOptions: { updateMarks: false } }));
            }
          }
        });
        return Promise.all(updateRequests);
      })
      .then(() => {
        return true;
      });
  },

  _setCertificationPublished(certifications, value) {
    const promises = certifications.reduce((result, certification) => {
      certification.set('isPublished', value);
      result.push(certification.save({ adapterOptions: { updateMarks: false } }));
      return result;
    }, []);
    return Promise.all(promises);
  },

  /*
   * Important note:
   * These actions will be removed when session report import is removed from admin
   * (temporary code)
   */

  _importODSReport(result) {
    const data = new Uint8Array(result);
    const workbook = XLSX.read(data, { type: 'array', cellDates:true });
    const first_sheet_name = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[first_sheet_name];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { range:8, header:['row', 'lastName', 'firstName', 'birthDate', 'birthPlace', 'email', 'externalId', 'extraTime', 'signature', 'certificationId', 'lastScreen', 'comments'] });

    const lastRow = jsonData.findIndex((row) => {
      return row.lastName == null;
    });
    const importedCandidates = jsonData.slice(0, lastRow);
    importedCandidates.forEach((candidate) => {
      if (candidate.birthDate instanceof Date) {
        const formatedDate = candidate.birthDate.toISOString();
        candidate.birthDate = formatedDate.substring(8,10) + '/' + formatedDate.substring(5,7) + '/' + formatedDate.substring(0,4);
      } else {
        candidate.birthDate = null;
      }
    });
    this.set('importedCandidates', importedCandidates);
    this.set('displaySessionReport', true);
  }
  /*
   * End of temporary code
   */

});
