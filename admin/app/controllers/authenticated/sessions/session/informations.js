import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { statusToDisplayName } from '../../../../models/session';

export default class IndexController extends Controller {
  @service sessionInfoService;
  @service notifications;
  @service currentUser;
  @service fileSaver;
  @service session;

  @alias('model') sessionModel;

  @tracked isShowingAssignmentModal = false;

  @computed('sessionModel.status')
  get sessionStatusLabel() {
    return statusToDisplayName[this.sessionModel.status];
  }

  @computed('currentUser.user', 'sessionModel.assignedCertificationOfficer.id')
  get isCurrentUserAssignedToSession() {
    const currentUserId = this.currentUser.user.get('id');
    const assignedCertificationOfficerId = this.sessionModel.assignedCertificationOfficer.get('id');
    return assignedCertificationOfficerId != null
      && currentUserId === assignedCertificationOfficerId;
  }

  @computed('sessionModel.assignedCertificationOfficer.id')
  get isAssigned() {
    return this.sessionModel.assignedCertificationOfficer.get('id') ? true : false;
  }

  @action
  async downloadSessionResultFile() {
    try {
      const sessionId = this.sessionModel.id;
      const url = `/api/admin/sessions/${sessionId}/results`;
      const fileName = 'resultats-session.csv';
      let token = '';
      if (this.session.isAuthenticated) {
        token = this.session.data.authenticated.access_token;
      }
      this.fileSaver.save({ url, fileName, token });
    } catch (error) {
      this.notifications.error(error);
    }
  }

  @action
  async downloadBeforeJuryFile() {
    try {
      const certifications = await this._loadAllCertifications(this.sessionModel);
      this.sessionInfoService.downloadJuryFile({ sessionId: this.sessionModel.id, certifications });
    } catch (error) {
      this.notifications.error(error);
    }
  }

  @action
  async tagSessionAsSentToPrescriber() {
    await this.sessionModel.save({ adapterOptions: { flagResultsAsSentToPrescriber: true } });
  }

  @action
  async checkForAssignment() {
    if (this.isAssigned) {
      this.isShowingAssignmentModal = true;
      return;
    }
    await this._assignSessionToCurrentUser();
  }

  @action
  cancelAssignment() {
    this.isShowingAssignmentModal = false;
  }

  @action
  async confirmAssignment() {
    await this._assignSessionToCurrentUser();
  }

  async _assignSessionToCurrentUser() {
    try {
      await this.sessionModel.save({ adapterOptions: { certificationOfficerAssignment: true } });
      this.notifications.success('La session vous a correctement été assignée');
    } catch (err) {
      this.notifications.error('Erreur lors de l\'assignation à la session');
    }
    this.isShowingAssignmentModal = false;
  }

  async _loadAllCertifications(session) {
    const certifications = [];
    for (let i = 0; i < session.juryCertificationSummaries.length; ++i) {
      const juryCertificationSummary = session.juryCertificationSummaries.objectAt(i);
      let certification = this.store.peekRecord('certification', juryCertificationSummary.id);
      if (!certification) {
        certification = await this.store.findRecord('certification', juryCertificationSummary.id);
      }
      certifications.push(certification);
    }

    return certifications;
  }
}
