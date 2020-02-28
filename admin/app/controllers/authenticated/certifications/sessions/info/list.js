import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import ENV from 'pix-admin/config/environment';
import { computed } from '@ember/object';
import EmberObject from '@ember/object';
import _ from 'lodash';

export default Controller.extend({

  session: service(),
  sessionModel: alias('model'),
  sessionInfoService: service(),
  notifications: service('notification-messages'),

  displayConfirm: false,
  displaySessionReport: false,
  confirmMessage: null,
  confirmAction: null,
  certificationsInSessionReport: null,

  init() {
    this._super();
    this.selected = [];
    this.set('certificationsInSessionReport', []);
    this.confirmAction = () => {};
  },

  canPublish: computed('model.certifications.@each.status', function() {
    return !(_.some(
      this.model.certifications.toArray(),
      (certif) => certif.status === 'error' || certif.status === 'started'
    ));
  }),

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
        hasSeenEndTestScreen: !_.isEmpty(certificationFromReport.lastScreen),
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
      if (!this.model.canPublish) {
        if (intention === 'publish') {
          this.set('confirmMessage', 'Souhaitez-vous publier la session ?');
          this.set('confirmAction', 'publishSession');
        } else {
          this.set('confirmMessage', 'Souhaitez-vous dépublier la session ?');
          this.set('confirmAction', 'unpublishSession');
        }
        this.set('displayConfirm', true);
      }
    },

    async publishSession() {
      try {
        await this.model.save({ adapterOptions: { updatePublishedCertifications: true, isPublished: true } });
        this.model.certifications.reload();
        this.notifications.success('Les certifications ont été correctement publiées.');
        this.set('displayConfirm', false);
      } catch (error) {
        this.notifications.error(error);
      }
    },

    async unpublishSession() {
      try {
        await this.model.save({ adapterOptions: { updatePublishedCertifications: true, isPublished: false } });
        this.model.certifications.reload();
        this.notifications.success('Les certifications ont été correctement dépubliées.');
        this.set('displayConfirm', false);
      } catch (error) {
        this.notifications.error(error);
      }
    },

    onCancelConfirm() {
      this.set('displayConfirm', false);
    },
  },
});
