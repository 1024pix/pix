import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'pix-admin/config/environment';

export default Controller.extend({

  session: service(),
  sessionInfoService: service(),
  notifications: service('notification-messages'),

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
      const { access_token } = this.get('session.data.authenticated');
      const url = `${ENV.APP.API_HOST}/${ENV.APP.ODS_PARSING_URL}`;
      try {
        const response = await file.upload(url, {
          headers: { Authorization: `Bearer ${access_token}` },
          method: 'PUT',
        });
        this.set('importedCandidates', response.body);
        this.set('displaySessionReport', true);
      }
      catch (err) {
        this.notifications.error(err);
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
