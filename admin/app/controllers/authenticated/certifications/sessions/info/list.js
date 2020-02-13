import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'pix-admin/config/environment';
import EmberObject from '@ember/object';
import _ from 'lodash';

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
  certificationsInSessionReport: null,

  init() {
    this._super();
    this.selected = [];
    this.set('certificationsInSessionReport', []);
    this.confirmAction = () => {
    };
  },

  _extractCertificationsFromSessionReportData(sessionReportData) {
    const certificationsIdsInSession = this.model.certifications.mapBy('id');
    return _.map(sessionReportData, (certificationFromReport) => {
      return EmberObject.create({
        id: certificationFromReport.certificationId,
        firstName: certificationFromReport.firstName,
        lastName: certificationFromReport.lastName,
        birthdate: certificationFromReport.birthdate,
        birthplace: certificationFromReport.birthplace,
        examinerComment: certificationFromReport.comments,
        externalId: certificationFromReport.externalId,
        extraTimePercentage: certificationFromReport.extraTimePercentage,
        hasSeenLastScreenFromPaperReport: !_.isEmpty(certificationFromReport.lastScreen),
        hasSeenLastScreenFromPaperReportEnhanced: certificationFromReport.lastScreenEnhanced,
        isInSession: _.includes(certificationsIdsInSession, certificationFromReport.certificationId),
      });
    });
  },

  _rollbackCertificationsModifications() {
    const certifications = this.model.get('certifications').toArray();
    certifications.forEach((certification) => {
      certification.rollbackAttributes();
    });
  },

  _parseSessionReportData(file) {
    const { access_token } = this.get('session.data.authenticated');
    const url = (`${ENV.APP.API_HOST}/${ENV.APP.ODS_PARSING_URL}`).replace('session_id', this.model.id);
    return file.upload(url, {
      headers: { Authorization: `Bearer ${access_token}` },
      method: 'PUT',
    });
  },

  _updateSessionCertificationsWithCertificationsFromSessionReport() {
    const sessionCertifications = this.model.get('certifications').toArray();
    _.each(this.certificationsInSessionReport, (certificationInReport) => {
      if (certificationInReport.isInSession) {
        const existingCertification = _.find(sessionCertifications, { 'id': certificationInReport.id });
        existingCertification.updateUsingCertificationInReport(certificationInReport);
      }
    });
  },

  actions: {

    onCloseSessionReportAnalysis() {
      this.set('certificationsInSessionReport', []);
      this.set('displaySessionReport', false);
    },

    async onDisplaySessionReportAnalysis(file) {
      try {
        const { body: sessionReportData } = await this._parseSessionReportData(file);
        const certifications = this._extractCertificationsFromSessionReportData(sessionReportData);
        this.set('certificationsInSessionReport', certifications);
        this.set('displaySessionReport', true);
      }
      catch (err) {
        this.notifications.error(err);
      }
    },

    async onUpdateSessionCertificationsWithReportData() {
      try {
        this._updateSessionCertificationsWithCertificationsFromSessionReport();
        const certificationsToSave = this.model.get('certifications').filter((certification) => {
          return certification.hasDirtyAttributes;
        });
        await Promise.all(certificationsToSave.map((certification) => {
          return certification.save({ adapterOptions: { updateMarks: false } });
        }));
      } catch (err) {
        this._rollbackCertificationsModifications();
        this.notifications.error(err);
      } finally {
        this.set('certificationsInSessionReport', []);
        this.set('displaySessionReport', false);
      }
    },

    onDownloadJuryFile() {
      try {
        this._updateSessionCertificationsWithCertificationsFromSessionReport();
        this.sessionInfoService.downloadJuryFile(this.model.id, this.model.certifications);
        this._rollbackCertificationsModifications();
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
