import Controller from '@ember/controller';
import json2csv from 'json2csv';
import Papa from 'papaparse';
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
    this._juryFields = {
      sessionId: 'ID de session',
      id: 'ID de certification',
      status: 'Statut de la certification',
      creationDate: 'Date de debut',
      completionDate: 'Date de fin',
      commentFromManager: 'Commentaire surveillant',
      commentForJury: 'Commentaire pour le jury',
      pixScore: 'Note Pix'
    };
    this._resultFields = {
      id: 'Numéro de certification',
      firstName: 'Prénom',
      lastName: 'Nom',
      birthdate: 'Date de naissance',
      birthplace: 'Lieu de naissance',
      externalId: 'Identifiant Externe',
      pixScore: 'Nombre de Pix',
      sessionId: 'Session',
      certificationCenter: 'Centre de certification',
      creationDate:'Date de passage de la certification'
    };

    this._csvHeaders = Object.values(this._fields).concat(this._competences);

    this._juryCsvHeaders = Object.values(this._juryFields).concat(this._competences);

    this._resultCsvHeaders = Object.values(this._resultFields).slice(0,-3).concat(this._competences).concat(Object.values(this._resultFields).slice(-3));

    this._csvImportFields = ['firstName', 'lastName', 'birthdate', 'birthplace', 'externalId'];

    this.selected = [];

    this.importedCandidates = [];
  },

  // Actions
  actions: {
    onExport() {
      return this._getExportJson(this._fields)
        .then((json) => {
          this.set('progress', false);
          const csv = json2csv.parse(json, {
            fields: this._csvHeaders,
            delimiter: ';',
            withBOM: false,
          });
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

    onSaveReportData(candidatesData) {
      return candidatesData
        .then((data) => {
          const certificationData = data.map((piece) => {
            const certificationItem = {};
            certificationItem[this._fields.id] = piece.certificationId;
            certificationItem[this._fields.firstName] = piece.firstName;
            certificationItem[this._fields.lastName] = piece.lastName;
            certificationItem[this._fields.birthdate] = piece.birthDate;
            certificationItem[this._fields.birthplace] = piece.birthPlace;
            certificationItem[this._fields.externalId] = piece.externalId;
            return certificationItem;
          });
          this.set('progressMax', certificationData.length);
          this.set('progressValue', 0);
          this.set('progress', true);
          return this._importCertificationsData(certificationData);
        })
        .then(() => {
          this.set('progress', false);
          this.get('notifications').success(candidatesData.length + ' lignes correctement importées');
        });
    },
    onGetJuryFile(candidatesWithComments) {
      const comments = candidatesWithComments.reduce((values, candidate) => {
        values[candidate.certificationId] = candidate.comments;
        return values;
      }, {});
      return this._getExportJson(this._juryFields)
        .then((json) => {
          this.set('progress', false);
          json = json.filter((item) => {
            const id = item[this._fields.id];
            if (comments[id] != null) {
              item[this._juryFields.commentFromManager] = comments[id];
              return true;
            }
            return item[this._fields.status] !== 'validated';
          });
          const csv = json2csv.parse(json, {
            fields: this._juryCsvHeaders,
            delimiter: ';',
            withBOM: false,
          });
          const fileName = 'jury_session_' + this.get('model.session.id') + ' ' + (new Date()).toLocaleString('fr-FR') + '.csv';
          this.fileSaver.saveAs(csv + '\n', fileName);
        });
    },

    onExportResults() {
      const dateFieldName = this._resultFields.creationDate;
      const centerFieldName = this._resultFields.certificationCenter;
      const centerName = this.get('model.session.certificationCenter');
      return this._getExportJson(this._resultFields)
        .then((json) => {
          this.set('progress', false);
          json.forEach((certification) => {
            this._competences.forEach((competence) => {
              if (certification[competence] == null || certification[competence] == 0 || certification[competence] == -1) {
                certification[competence] = '-';
              }
            });
            certification[dateFieldName] = certification[dateFieldName].substring(0,10);
            certification[centerFieldName] = centerName;
          });
          const csv = json2csv.parse(json, {
            fields: this._resultCsvHeaders,
            delimiter: ';',
            withBOM: false,
          });
          const fileName = 'resultats_session_' + this.get('model.session.id') + ' ' + (new Date()).toLocaleString('fr-FR') + '.csv';
          this.fileSaver.saveAs(csv + '\n', fileName);
        });
    }

    /*
     * End of temporary code
     */

  },

  // Private methods

  _getExportJson(fields) {
    const ids = this.get('model.certificationIds').toArray();
    this.set('progressMax', ids.length);
    this.set('progressValue', 0);
    this.set('progress', true);
    return this._getExportJsonPart(ids, [], fields);
  },

  _getExportJsonPart(certificationsIds, json, fields) {
    const ids = certificationsIds.splice(0, 10);
    return this._getCertificationsJson(ids, fields)
      .then((value) => {
        this.set('progressValue', this.progressValue + value.length);
        if (certificationsIds.length > 0) {
          return this._getExportJsonPart(certificationsIds, json.concat(value), fields);
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

  _getCertificationsJson(ids, fields) {
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
            current.push(this._getJsonRow(certification, fields));
          }
          return current;
        }, []);
      });
  },

  _getJsonRow(certification, fields) {
    const data = Object.keys(fields).reduce((currentData, field) => {
      const header = fields[field];
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
          // check that session id is correct
          if (newDataPiece && certification.get('sessionId') == this.get('model.session.id')) {
            this._csvImportFields.forEach((key) => {
              const fieldName = this._fields[key];
              let fieldValue = newDataPiece[fieldName];
              if (fieldValue) {
                if (fieldValue.length == 0) {
                  fieldValue = null;
                }
                certification.set(key, fieldValue);
              }
            });
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

  _importCSVData(data) {
    // We delete the BOM UTF8 at the beginning of the CSV,
    // otherwise the first element is wrongly parsed.
    const csvRawData = data.toString('utf8').replace(/^\uFEFF/, '');
    const parsedCSVData = Papa.parse(csvRawData, { header: true, skipEmptyLines: true }).data;
    const rowCount = parsedCSVData.length;
    this.set('progressMax', parsedCSVData.length);
    this.set('progressValue', 0);
    this.set('progress', true);
    return this._importCertificationsData(parsedCSVData)
      .then(() => {
        this.set('progress', false);
        this.get('notifications').success(rowCount + ' lignes correctement importées');
      })
      .catch((error) => {
        this.set('progress', false);
        this.get('notifications').error(error);
      });
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
