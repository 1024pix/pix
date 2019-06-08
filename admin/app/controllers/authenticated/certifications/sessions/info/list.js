import Controller from '@ember/controller';
import json2csv from 'json2csv';
import Papa from 'papaparse';
import { inject as service } from '@ember/service';
import moment from 'moment';
import XLSX from 'xlsx';
import _ from 'lodash';

const competenceIndexes = [
  '1.1', '1.2', '1.3',
  '2.1', '2.2', '2.3', '2.4',
  '3.1', '3.2', '3.3', '3.4',
  '4.1', '4.2', '4.3',
  '5.1', '5.2'
];

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
    this.selected = [];
    this.importedCandidates = [];
  },

  actions: {

    async importAndLinkCandidatesToTheSessionCertifications(file) {
      const csvAsText = await file.readAsText();
      // XXX We delete the BOM UTF8 at the beginning of the CSV, otherwise the first element is wrongly parsed.
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

    async downloadSessionResultFile() {
      const dataRows = this._buildSessionExportFileData();
      const fileHeaders = this._buildSessionExportFileHeaders();
      const csv = json2csv.parse(dataRows, { fields: fileHeaders, delimiter: ';', withBOM: true });
      const fileName = 'resultats_session_' + this.model.id + ' ' + (new Date()).toLocaleString('fr-FR') + '.csv';
      this.fileSaver.saveAs(csv + '\n', fileName);
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

    downloadGetJuryFile(attendanceSheetCandidates) {
      const sessionCertifications = this.model.certifications;
      const certificationsToBeReviewed = this._getSessionCertificationsToBeReviewed(sessionCertifications, attendanceSheetCandidates);
      const data = this._buildJuryFileData(certificationsToBeReviewed, attendanceSheetCandidates);
      const fileHeaders = this._buildJuryFileHeaders();
      const csv = json2csv.parse(data, { fields: fileHeaders, delimiter: ';', withBOM: true, });
      const fileName = 'jury_session_' + this.model.id + ' ' + (new Date()).toLocaleString('fr-FR') + '.csv';
      this.fileSaver.saveAs(`${csv}\n`, fileName);
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

  },

  // Private methods

  _buildSessionExportFileData() {
    return this.model.certifications.map((certification) => {
      const rowItem = {};

      rowItem['Numéro de certification'] = certification.id;
      rowItem['Prénom'] = certification.firstName;
      rowItem['Nom'] = certification.lastName;
      rowItem['Date de naissance'] = certification.birthdate;
      rowItem['Lieu de naissance'] = certification.birthplace;
      rowItem['Identifiant Externe'] = certification.externalId;
      rowItem['Nombre de Pix'] = certification.pixScore;

      const certificationIndexedCompetences = certification.indexedCompetences;
      competenceIndexes.forEach((competence) => {
        if (!certificationIndexedCompetences[competence] || certificationIndexedCompetences[competence].level === 0 || certificationIndexedCompetences[competence].level === -1) {
          rowItem[competence] = '-';
        } else {
          rowItem[competence] = certificationIndexedCompetences[competence].level;
        }
      });

      rowItem['Session'] = this.model.id;
      rowItem['Centre de certification'] = this.model.certificationCenter;
      rowItem['Date de passage de la certification'] = certification.creationDate.substring(0, 10);

      return rowItem;
    });
  },

  _buildSessionExportFileHeaders() {
    return _.concat(
      [
        'Numéro de certification', 
        'Prénom', 
        'Nom', 
        'Date de naissance', 
        'Lieu de naissance', 
        'Identifiant Externe', 
        'Nombre de Pix'
      ],
      competenceIndexes,
      [
        'Session', 
        'Centre de certification', 
        'Date de passage de la certification'
      ]
    );
  },

  _getSessionCertificationsToBeReviewed(certifications, attendanceSheetCandidates) {
    const candidatesToBeReviewed = _.filter(attendanceSheetCandidates, (candidate) => {
      const hasCommentFromManager = !!candidate.comments && candidate.comments.trim() !== '';
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

  _buildJuryFileData(certifications, attendanceSheetCandidates) {
    return certifications.map((certification) => {
      const rowItem = {};

      const certificationCandidate = _.find(attendanceSheetCandidates, ['certificationId', certification.id]);

      rowItem['ID de session'] = this.model.id;
      rowItem['ID de certification'] = certification.id;
      rowItem['Statut de la certification'] = certification.status;
      rowItem['Date de debut'] = certification.creationDate;
      rowItem['Date de fin'] = certification.completionDate;
      rowItem['Commentaire surveillant'] = certificationCandidate.comments;
      rowItem['Commentaire pour le jury'] = certification.commentForJury;
      rowItem['Note Pix'] = certification.pixScore;

      const certificationIndexedCompetences = certification.indexedCompetences;
      competenceIndexes.forEach((competence) => {
        rowItem[competence] = certificationIndexedCompetences[competence] ? certificationIndexedCompetences[competence].level : '';
      });

      return rowItem;
    });

  },

  _buildJuryFileHeaders() {
    return _.concat(
      [
        'ID de session', 
        'ID de certification', 
        'Statut de la certification', 
        'Date de debut', 
        'Date de fin', 
        'Commentaire surveillant', 
        'Commentaire pour le jury', 
        'Note Pix'
      ],
      competenceIndexes
    );
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

  _updateCertifications(data) {
    const store = this.store;
    const requests = [];
    const newData = {};
    data.forEach((piece) => {
      const id = piece[this._fields.id];
      newData[id] = piece;
      requests.push(store.findRecord('certification', id));
    });

    const csvImportFields = ['firstName', 'lastName', 'birthdate', 'birthplace', 'externalId'];

    return Promise.all(requests)
      .then((certifications) => {
        const updateRequests = [];
        certifications.forEach((certification) => {
          const id = certification.get('id');
          const sessionId = certification.get('sessionId').toString();
          const newDataPiece = newData[id];
          // check that session id is correct
          if (newDataPiece && sessionId === this.model.id) {
            csvImportFields.forEach((key) => {
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
