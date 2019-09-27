import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  // DI
  sessionInfoService: service(),
  notifications: service('notification-messages'),

  // Properties
  displayConfirm: false,
  displaySessionReport: false,
  confirmMessage: null,
  confirmAction: null,
  showSelectedActions: false,
  selectedCertifications: null,

  init() {
    this._super();
    this.selected = [];
    this.importedCandidates = [];
    this.confirmAction = () => {
    };
  },

  actions: {

    async onSaveReportData(candidatesData) {
      try {
        await this.sessionInfoService.updateCertificationsFromCandidatesData(this.model.certifications, candidatesData);
        this.notifications.success(`${candidatesData.length} lignes correctement importé(e)s.`);
        this.set('displaySessionReport', false);
      } catch (error) {
        this.notifications.error(error);
      }
    },

    async displayCertificationSessionReportModal(file) {
      try {
        const attendanceSheetCandidates = await this.sessionInfoService.readSessionAttendanceSheet(file);
        this.set('importedCandidates', attendanceSheetCandidates);
        this.set('displaySessionReport', true);
      } catch (error) {
        this.notifications.error(error);
      }
    },

    downloadSessionResultFile() {
      try {
        this.sessionInfoService.downloadSessionExportFile(this.model);
      } catch (error) {
        this.notifications.error(error);
      }
    },

    downloadJuryFile(attendanceSheetCandidates) {
      try {
        this.sessionInfoService.downloadJuryFile(this.model, attendanceSheetCandidates);
      } catch (error) {
        this.notifications.error(error);
      }
    },

    displayCertificationStatusUpdateConfirmationModal(intention = 'publish') {
      const count = this.selectedCertifications.length;
      if (intention === 'publish') {
        if (count === 1) {
          this.set('confirmMessage', 'Souhaitez-vous publier la certification sélectionnée ?');
        } else {
          this.set('confirmMessage', `Souhaitez-vous publier les ${count} certifications sélectionnées ?`);
        }
        this.set('confirmAction', 'publishSelectedCertifications');
      } else {
        if (count === 1) {
          this.set('confirmMessage', 'Souhaitez-vous dépublier la certification sélectionnée ?');
        } else {
          this.set('confirmMessage', `Souhaitez-vous dépublier les ${count} certifications sélectionnées ?`);
        }
        this.set('confirmAction', 'unpublishSelectedCertifications');
      }
      this.set('displayConfirm', true);
    },

    async publishSelectedCertifications() {
      try {
        await this.sessionInfoService.updateCertificationsStatus(this.selectedCertifications, true);
        if (this.selectedCertifications.length === 1) {
          this.notifications.success('La certification a été correctement publiée.');
        } else {
          this.notifications.success(`Les ${this.selectedCertifications.length} certifications ont été correctement publiées.`);
        }
        this.set('displayConfirm', false);
      } catch (error) {
        this.notifications.error(error);
      }
    },

    async unpublishSelectedCertifications() {
      try {
        await this.sessionInfoService.updateCertificationsStatus(this.selectedCertifications, false);
        if (this.selectedCertifications.length === 1) {
          this.notifications.success('La certification a été correctement dépubliée.');
        } else {
          this.notifications.success(`Les ${this.selectedCertifications.length} certifications ont été correctement dépubliées.`);
        }
        this.set('displayConfirm', false);
      } catch (error) {
        this.notifications.error(error);
      }
    },

    onCancelConfirm() {
      this.set('displayConfirm', false);
    },

    onListSelectionChange(e) {
      this.set('selectedCertifications', e.selectedItems);
      this.set('showSelectedActions', e.selectedItems.length > 0);
    },

  },

});
