import Controller from '@ember/controller';
import json2csv from 'json2csv';
import Papa from 'papaparse';
import { inject as service } from '@ember/service';
import moment from 'moment';
import XLSX from 'xlsx';
import _ from 'lodash';

export default Controller.extend({

  // DI
  fileSaver: service('file-saver'),
  notifications: service('notification-messages'),

  // Properties
  displayConfirm: false,
  displaySessionReport: false,
  confirmMessage: null,
  confirmAction: 'onPublishSelected',
  showSelectedActions: false,
  selectedCertifications: null,

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
      commentForOrganization: 'Commentaire pour l’organisation',
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
      creationDate: 'Date de passage de la certification'
    };

    this._resultCsvHeaders = Object.values(this._resultFields).slice(0, -3).concat(this._competences).concat(Object.values(this._resultFields).slice(-3));

    this._csvImportFields = ['firstName', 'lastName', 'birthdate', 'birthplace', 'externalId'];

    this.selected = [];

    this.importedCandidates = [];
  },

  actions: {

    async importAndLinkCandidatesToTheSessionCertifications(file) {
      const csvAsText = await file.readAsText();
      // We delete the BOM UTF8 at the beginning of the CSV,
      // otherwise the first element is wrongly parsed.
      const csvRawData = csvAsText.toString('utf8').replace(/^\uFEFF/, '');
      const parsedCSVData = Papa.parse(csvRawData, { header: true, skipEmptyLines: true }).data;
      const rowCount = parsedCSVData.length;
      try {
        await this._importCertificationsData(parsedCSVData);
        this.notifications.success(rowCount + ' lignes correctement importées');
      } catch (error) {
        this.notifications.error(error);
      }
    },

    async displayCertificationSessionReport(file) {
      const arrayBuffer = await file.readAsArrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const headerRowsNumber = 8;
      const header = ['row', 'lastName', 'firstName', 'birthDate', 'birthPlace', 'email', 'externalId', 'extraTime', 'signature', 'certificationId', 'lastScreen', 'comments'];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: headerRowsNumber, header });

      const lastRowIndex = jsonData.findIndex((row) => !row.lastName);
      const importedCandidates = jsonData.slice(0, lastRowIndex);
      importedCandidates.forEach((candidate) => {
        candidate.certificationId = candidate.certificationId.toString();
        if (candidate.birthDate instanceof Date) {
          candidate.birthDate = moment(candidate.birthDate).format('DD/MM/YYYY');
        } else {
          candidate.birthDate = null;
        }
      });
      this.set('importedCandidates', importedCandidates);
      this.set('displaySessionReport', true);
    },

    async downloadResultsAfterJurysDeliberation() {
      const dateFieldName = this._resultFields.creationDate;
      const centerFieldName = this._resultFields.certificationCenter;
      const centerName = this.model.certificationCenter;
      const resultsAsJson = await this._getExportJson(this._resultFields);

      resultsAsJson.forEach((certification) => {
        this._competences.forEach((competence) => {
          if (!certification[competence] || certification[competence] === 0 || certification[competence] === -1) {
            certification[competence] = '-';
          }
        });
        certification[dateFieldName] = certification[dateFieldName].substring(0, 10);
        certification[centerFieldName] = centerName;
      });
      const csv = json2csv.parse(resultsAsJson, {
        fields: this._resultCsvHeaders,
        delimiter: ';',
        withBOM: false,
      });
      const fileName = 'resultats_session_' + this.model.id + ' ' + (new Date()).toLocaleString('fr-FR') + '.csv';
      this.fileSaver.saveAs(csv + '\n', fileName);
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

    async onSaveReportData(candidatesData) {
      const certificationData = candidatesData.map((piece) => {
        const certificationItem = {};
        certificationItem[this._fields.id] = piece.certificationId;
        certificationItem[this._fields.firstName] = piece.firstName;
        certificationItem[this._fields.lastName] = piece.lastName;
        certificationItem[this._fields.birthdate] = piece.birthDate;
        certificationItem[this._fields.birthplace] = piece.birthPlace;
        certificationItem[this._fields.externalId] = piece.externalId;
        return certificationItem;
      });
      try {
        await this._importCertificationsData(certificationData);
        this.notifications.success(candidatesData.length + ' lignes correctement importées');
        this.set('displaySessionReport', false);
      } catch (error) {
        this.notifications.error(error);
      }
    },

    async onGetJuryFile(attendanceSheetCandidates) {
      const sessionCertifications = this.model.certifications;
      const certificationsToBeReviewed = this._getSessionCertificationsToBeReviewed(sessionCertifications, attendanceSheetCandidates);
      const dataRows = this._convertCertificationsToBeReviewedIntoJsonDataRows(certificationsToBeReviewed, attendanceSheetCandidates);
      const fileHeaders = _.concat(Object.values(this._juryFields), this._competences);
      const csv = json2csv.parse(dataRows, { fields: fileHeaders, delimiter: ';', withBOM: true, });
      const fileName = 'jury_session_' + this.model.id + ' ' + (new Date()).toLocaleString('fr-FR') + '.csv';
      this.fileSaver.saveAs(`${csv}\n`, fileName);
    },

  },

  // Private methods

  _getSessionCertificationsToBeReviewed(certifications, attendanceSheetCandidates) {
    const candidatesToBeReviewed = _.filter(attendanceSheetCandidates, (candidate) => {
      const hasCommentFromManager = candidate.comments && candidate.comments.trim() !== '';
      const didNotSeenEndScreen = !candidate.lastScreen || candidate.lastScreen.trim() === '';
      return hasCommentFromManager || didNotSeenEndScreen;
    });

    const certificationIdsOfCandidatesToBeReviewed = _.map(candidatesToBeReviewed, (candidate) => candidate.certificationId.trim());

    return certifications.filter((certification) => {
      const hasInvalidCandidate = _.includes(certificationIdsOfCandidatesToBeReviewed, certification.id);
      const hasInvalidStatus = certification.status !== 'validated';
      return hasInvalidCandidate || hasInvalidStatus;
    });
  },

  _convertCertificationsToBeReviewedIntoJsonDataRows(certifications, attendanceSheetCandidates) {
    return certifications.map((certification) => {
      const rowItem = {};

      const certificationCandidate = _.find(attendanceSheetCandidates, ['certificationId', certification.id]);

      rowItem[this._juryFields.sessionId] = this.model.id;
      rowItem[this._juryFields.id] = certification.id;
      rowItem[this._juryFields.status] = certification.status;
      rowItem[this._juryFields.creationDate] = certification.creationDate;
      rowItem[this._juryFields.completionDate] = certification.completionDate;
      rowItem[this._juryFields.commentFromManager] = certificationCandidate.comments;
      rowItem[this._juryFields.commentForJury] = certification.commentForJury;
      rowItem[this._juryFields.pixScore] = certification.pixScore;

      const certificationIndexedCompetences = certification.get('indexedCompetences');
      this._competences.forEach((competence) => {
        rowItem[competence] = certificationIndexedCompetences[competence] ? certificationIndexedCompetences[competence].level : '';
      });

      return rowItem;
    });

  },

  _getExportJson(fields) {
    const certificationIds = this.model.certifications.map((certification) => certification.id);
    return this._getExportJsonPart(certificationIds, [], fields);
  },

  _getExportJsonPart(certificationsIds, json, fields) {
    const ids = certificationsIds.splice(0, 10);
    return this._getCertificationsJson(ids, fields)
      .then((value) => {
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
    return this._publishCertifications(certifications.slice(0), value)
      .then(() => {
        if (count === 1) {

          this.notifications.success('La certification a été correctement ' + (value ? 'publiée' : 'dépubliée'));
        } else {
          this.notifications.success('Les ' + count + ' certifications ont été correctement ' + (value ? 'publiées' : 'dépubliées'));
        }
      })
      .catch((error) => {
        this.notifications.error(error);
      });
  },

  _publishCertifications(certifications, value) {
    const piece = certifications.splice(0, 10);
    return this._setCertificationPublished(piece, value)
      .then(() => {
        if (certifications.length > 0) {
          return this._publishCertifications(certifications, value);
        } else {
          return true;
        }
      });
  },

  _getCertificationsJson(certificationIds, fields) {
    const store = this.store;
    const requests = certificationIds.map((id) => {
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
          const sessionId = certification.get('sessionId').toString();
          const newDataPiece = newData[id];
          // check that session id is correct
          if (newDataPiece && sessionId === this.model.id) {
            this._csvImportFields.forEach((key) => {
              const fieldName = this._fields[key];
              let fieldValue = newDataPiece[fieldName];
              if (fieldValue) {
                if (fieldValue.length === 0) {
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

});
