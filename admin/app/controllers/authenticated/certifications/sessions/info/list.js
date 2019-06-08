import Controller from '@ember/controller';
import Papa from 'papaparse';
import { inject as service } from '@ember/service';
import moment from 'moment';
import XLSX from 'xlsx';

export default Controller.extend({

  // DI
  sessionInfoService: service(),
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
      this.sessionInfoService.downloadSessionExportFile(this.model);
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
      this.sessionInfoService.downloadGetJuryFile(this.model, attendanceSheetCandidates);
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
