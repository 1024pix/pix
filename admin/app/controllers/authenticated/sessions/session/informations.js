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
  @service notifications;

  @alias('model') session;

  @tracked isShowingAssignmentModal = false;

  @computed('session.status')
  get sessionStatusLabel() {
    return statusToDisplayName[this.session.status];
  }

  @computed('session.assignedCertificationOfficer.id')
  get isCurrentUserAssignedToSession() {
    const currentUserId = this.currentUser.user.get('id');
    const assignedCertificationOfficerId = this.session.assignedCertificationOfficer.get('id');
    return this.session.assignedCertificationOfficer
      ? currentUserId === assignedCertificationOfficerId
      : false;
  }

  @action
  downloadSessionResultFile() {
    try {
      this.sessionInfoService.downloadSessionExportFile(this.session);
    } catch (error) {
      this.notifications.error(error);
    }
  }

  @action
  downloadBeforeJuryFile() {
    try {
      this.sessionInfoService.downloadJuryFile(this.model.id, this.model.certifications);
    } catch (error) {
      this.notifications.error(error);
    }
  }

  @action
  async tagSessionAsSentToPrescriber() {
    await this.session.save({ adapterOptions: { flagResultsAsSentToPrescriber: true } });
  }

  @action
  async checkForAssignment() {
    if (this.session.assignedCertificationOfficer) {
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
      await this.session.save({ adapterOptions: { certificationOfficerAssignment: true } });
      this.notifications.success('La session vous a correctement été assignée');
    } catch (err) {
      this.notifications.error('Erreur lors de l\'assignation à la session');
    }
    this.isShowingAssignmentModal = false;
  }
}
